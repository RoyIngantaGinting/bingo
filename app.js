// Modules
var express = require('express')
	, http = require('http')
	, sio = require('socket.io')
	, passport = require('passport')
	, LocalStrategy = require('passport-local').Strategy
	, db = require('./models/bingodb')
	, reqValidator = require('./controllers/requestvalidator')
	, tokenizer = require('./controllers/tokenizer')
	, message = require('./models/message')
	, Kontainer = require('./models/kontainer')
	, common = require('./common')
	, mailer = require('./controllers/mailhandler')
	, sha1 = require('sha1');

// Global constant
const GAME_PER_PAGE = 5
	,PORT = (process.env.VMC_APP_PORT || 3000)
	,HOST = (process.env.VMC_APP_HOST || '0.0.0.0')
	,OUTERHOST = 'localhost'
	,OUTERPORT = ':3000'
	,SERVER = 'http://' + OUTERHOST + OUTERPORT + "/"
	,NUMBEROFPLAYER = 2
	,BINGOLINES = 5;

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done){
	var pemain = { _id: id, };
	
	db.getPlayer(pemain, function(err, result){
		done(err, result);
	});
});

passport.use(new LocalStrategy(
	{usernameField: 'email', passwordField: 'password'},
	function(username, password, done) {
		authenticate(username, password, done);
	}
));


var app = express()
	, server = http.createServer(app)
	, io = sio.listen(server);
	
// Modules configuration
io.configure('development', function(){
	io.set('transports', ['xhr-polling']);
});
app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.methodOverride());
	app.use(express.session({secret: 'lembu arablah'}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(express.static(__dirname + '/public'));
	app.use(app.router);
	app.use(function(req, res){
		res.status(404);
		res.send('{error: definitely, msg: You should not be here}');
	});
});

// Miscellaneous functions (utilities)
function authenticate(username, password, fn){
	var hpass = sha1(password),
		pemain = {email: username, password: hpass};
	
	db.getPlayer(pemain, function(err, result){
		if (err) { return fn(err, false); }
		if (!result){
			return fn(null, false);
		} else {
			return fn(null, result);
		}
	});
}

function ensureAuthenticated(req, next, fail) {
  if (req.isAuthenticated()) { return next(); }
  return fail();
}


// Routing
// Get method
app.get('/', function( req, res ){
	res.redirect('/login');
});

app.get('/dbcredential', function(req, res){
	var env = JSON.parse(process.env.VCAP_SERVICES);
	var mongo = env['mongodb-1.8'][0]['credentials'];
	res.end(JSON.stringify(mongo));
});

app.get('/bingo', function( req, res ){
	ensureAuthenticated(req,
	function(){
		res.render('menu', { name: req.session.name, server: SERVER });
	},
	function(){
		res.redirect('/login');
	});
});

app.get('/create', function( req, res ){
	ensureAuthenticated( req,
	function(){
		var gid = tokenizer.genToken()
			,stat = new Kontainer();
		stat.generate();
		
		var pemain = { pid: req.session.passport.user,
					name: req.session.name,
					bingo: stat.minimize(),
					path: tokenizer.nextToken(10),
				},
			info = [pemain, {}];
		
		db.createGame(gid, info, function(err){
			if (err){
				common.sendJSONResponse(res, message.getServerErrorMsg());
			} else {
				var data = {
					bingo: stat.minimize(),
					total: stat.size()*stat.size()
					,turn: 0
					,action: 'create'
					,gid: gid
					,path: pemain.path
				}
				common.sendJSONResponse(res, data);
			}
		});
	},
	function(){
		res.redirect('/login');
	});
});

app.get('/join/:gid', function( req, res ){
	ensureAuthenticated( req,
	function(){
		var gid = req.params.gid
			,stat = new Kontainer();
		stat.generate();
		
		var pemain = { pid: req.session.passport.user
					,name: req.session.name
					,bingo: stat.minimize()
					,path: tokenizer.nextToken(10)
				};
		db.getGame(gid, function(err, data){
			if (err){
				common.sendJSONResponse(res, message.getServerErrorMsg());
			} else {
				if (data){
					data.info[1] = pemain;
					db.updateGame(gid, {info: data.info}, function(err, data){
						var resObj = {
							bingo: stat.minimize(),
							total: stat.size()*stat.size()
							,turn: 1
							,gid: gid
							,path: pemain.path
						};
						
						common.sendJSONResponse(res, resObj);
					});
				} else {
					common.sendJSONResponse(res, message.getDefaultErrorMsg());
				}
			}
		});
	},
	function(){
		res.redirect('/login');
	});
});

app.get('/list/:page', function( req, res ){
	var temp = req.params.page ? 1 : req.params.page
		,page = temp != 'undefined' || temp <= 0 ? 1 : temp
		,limit = GAME_PER_PAGE * page
		,skip = limit - GAME_PER_PAGE;

	db.listGame(limit, skip, function(err, data){
		var game = {total: 0, list: []}
			,i=0;

		if (!err){
			if (data){
				data.toArray(function(err, list){
					if (!err){
						game.total = list.length;
						for(;i<game.total; i++){
							game.list.push({gid: list[i]._id, name: list[i].info[0].name});
						}
						common.sendJSONResponse(res, game);
					} else {
						common.sendJSONResponse(res, message.getServerErrorMsg());
					}
				});
			} else {
				common.sendJSONResponse(res, game);
			}
		} else {
			common.sendJSONResponse(res, message.getServerErrorMsg());
		}
	});
});

app.get('/login', function( req, res ){
	ensureAuthenticated( req,
	function(){
		res.redirect('/bingo');
	},
	function(){
		res.render('login', {message: 'All fields are required'});
	});
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

app.get('/quit/:gid', function(req, res){
	ensureAuthenticated(req,
	function(){
		var gid = req.params.gid
			,pid = req.session.passport.user
			,winner = 0;

		db.getGame(gid, function(err, data){
			if (!err){
				if (data){
					winner = data.info[0].pid == pid ? 1 : 0;
	
					db.updateGame(gid, {status: message.STATUS_END, winner: winner}, function(err){
						if (!err){
							common.sendJSONResponse(res, message.getQuitMessage());
						} else {
							common.sendJSONResponse(res, message.getServerErrorMsg());
						}
					});
				} else {
					common.sendJSONResponse(res, message.getDefaultErrorMsg());
				}
			} else {
				common.sendJSONResponse(res, message.getServerErrorMsg());
			}
		})
	},
	function(){
		res.redirect('/login');
	});
});

app.get('/signup/:signupkey', function(req, res){
	var signupkey = req.params.signupkey;
	
	db.getInvitation(signupkey, function(err, data){
		if (data){
			res.render('signup', {message: 'All fields are required', server: SERVER, signupkey: signupkey});
		} else {
			res.redirect('/login');
		}
	});
});

// Post Method
app.post('/invite', function(req, res){
	
	ensureAuthenticated(req,
	function(){
		var email = req.body.email
			,invitekey = tokenizer.nextToken(10)
			,user = req.session.passport.user
			,invitation = {key: invitekey, by: user, active: true}
			,url = SERVER + "signup/" + invitekey
			,mailOptions = {
				to: email,
				html: "Dear Friend,<br><br>One of your friend, " + req.session.name + ", invite you to join to Bingo<br>You can follow this link <a href='" + url + "'>Bingo Registration</a>" 
			}
			,invitationFunc = function(err, data){
					if (err){
						common.sendJSONResponse(res, message.getServerErrorMsg());
					} else {
						mailer.sendMail(mailOptions, function(err, data){
							if (err){
								common.sendJSONResponse(res, message.getServerErrorMsg());
							} else {
								common.sendJSONResponse(res, message.getInvitationSendMsg());
							}
						});
					}
				}
		
		db.getInvitationByUser(user, function(err, data){
			if (err){
				common.sendJSONResponse(res, message.getServerErrorMsg());
			} else {
				if (data){
					data.toArray(function(err, list){
						if (err) {
							common.sendJSONResponse(res, message.getServerErrorMsg());
						} else {
							var total = list.length;
							
							if (total < req.session.limit){
								db.addInvitation(invitation, invitationFunc);
							} else {
								common.sendJSONResponse(res, message.getInvitationLimitMsg());
							}
						}
					});
				} else {
					db.addInvitation(invitation, invitationFunc);
				}
			}
		});
	},
	function(){
		res.redirect('/login');
	});
});

app.post('/login', 
	passport.authenticate('local', { failureRedirect: '/' }),
	function(req, res){
		passport.deserializeUser(req.session.passport.user,
			function(err, result){
				req.session.name = result.name;
				req.session.email = result.email;
				req.session.password = result.password;
				req.session.limit = result.limit
				res.redirect('/bingo');
			});
	});

app.post('/password', function( req, res ){
		ensureAuthenticated( req,
		function(){
			var opasswd = req.body.opassword
				,npasswd = req.body.npassword
				,pid = req.session.passport.user;

			if (opasswd == req.session.password){
				db.updatePlayer(pid, {password: npasswd}, function(err){
					common.sendJSONResponse(res, message.getChPasswdSuccessMsg());
				});
			} else { common.sendJSONResponse(res, message.getChPasswdFailMsg()); }
		},
		function(){
			res.redirect('/login');
		});
	});

app.post('/signup', function( req, res ){
	var body = req.body
		, valid = reqValidator.isCreatePlayerReq( req )
		, result = message.getDefaultErrorMsg();

	if (valid){
		var pemain = {email: body.email}
			,signupkey = body.signupkey;
		
		db.getPlayer(pemain, function(err, result){
			
			if (err){
				common.sendJSONResponse(res, message.getServerErrorMsg());
			} else if (result){
				common.sendJSONResponse(res, message.getEmailRegisteredMsg());
			} else {
				
				db.addPlayer(tokenizer.nextToken(15), body.name, body.email, sha1(body.password), function(err, data){
					if (err){
						result = message.getServerErrorMsg();
					} else {
						result = message.getSignupMsg();
						db.updateInvitation(signupkey);
					}
					
					common.sendJSONResponse(res, result);
				});
			}
		});
	} else {
		common.sendJSONResponse(res, result);
	}
});


// Socket communication
io.sockets.on('connection', function(socket){
	function quit(){
		socket.get('path', function(err, path){
			try{
				if (err) throw err;
				var flags = path.split('-')
					,winner = flags[2] == 1 ? 0 : 1
					,update = {status: message.STATUS_END, winner: winner};
				
				db.getGame(flags[0], function(err, game){
					try{
						if (game.status != message.STATUS_END){
							var line = 'end-' + game._id + '-' + game.info[winner].path,
								winning = {action: 'end', winner: winner, reason: 'Your foe quit'};
							
							if (err) throw err;
							socket.broadcast.emit(line, JSON.stringify(winning));
							db.updateGame(flags[0], update);
						}
					} catch (newerr){ console.log('2', patherr); }
				});
			} catch (patherr){ console.log('1', patherr); }
		});
	}
	socket.on('create', function(room){
		var path = room + '-0';
		socket.set('path', path, function(err){
			if (err){ throw err; }
			var flags = room.split('-')
				,where = {_id: flags[0]};
			
			db.getGame(flags[0], function(err, data){
				if (err) throw err;
				
				if (data.info[0].path == flags[1]){
					db.updateSpesificGame(where, {status: message.STATUS_WAITING});
				}
			});
		});
	});
	socket.on('disconnect', function(){
		quit();
	});
	socket.on('join', function(room){
		var path = room + '-1'
			,flags = room.split('-');

		db.getGame(flags[0], function(err, data){
			if (err) throw err;
			if (data){
				if (data.status === message.STATUS_WAITING){
					var jalur = ['start-' + data._id + '-' + data.info[0].path, 'start-' + data._id + '-' + data.info[1].path]
						,msg = {current: data.current};
					
					socket.set('path', path);
					db.updateGame(flags[0], {status: message.STATUS_PLAYING});
					io.sockets.emit(jalur[1], JSON.stringify(msg));
					io.sockets.emit(jalur[0], JSON.stringify(msg));
				}
			} else {
				console.log('join data not exist');
			}
		});
	});
	socket.on('quit', function(msg){
		quit();
	});
	socket.on('update', function(msg){
		socket.get('path', function(err, path){
			if (err) throw err;
			var flags = path.split('-');
			
			db.getGame(flags[0], function(err, game){
				if (err) throw err;
				if (game.status == message.STATUS_END) return;
				
				if (game.current == flags[2]){
					var players = [new Kontainer(), new Kontainer()]
						, i = 0
						,response = new Array()
						,finish = false
						,foe = game.current == 0 ? 1 : 0
						,winner = {turn: game.current}
						,lines = [game._id + '-' + game.info[0].path, game._id + '-' + game.info[1].path];
					
					for (;i<NUMBEROFPLAYER; i++){
						players[i].maximize(game.info[i].bingo);
						players[i].markByValue(parseInt(msg));
						response[i] = players[i].minimize();
						response[i].current = game.current == 0 ? 1 : 0;
						
						game.info[i].bingo.values = response[i].values;
						game.info[i].bingo.lines = response[i].lines;
					}
					response[0].score = response[1].lines;
					response[1].score = response[0].lines;
					for (i=0; i<NUMBEROFPLAYER; i++){
						io.sockets.emit('update-' + lines[i], JSON.stringify(response[i]));
					}
					if (players[game.current].isLinesComplete()){
						finish = true;
					} else if (players[foe].isLinesComplete()){
						finish = true;
						winner.turn = foe;
					}
					
					if (finish){
						for (i=0; i<NUMBEROFPLAYER; i++){
							io.sockets.emit('end-' + lines[i], JSON.stringify(winner));
						}
						game.status = message.STATUS_END;
					}
					db.updateGame(flags[0], {current: response[0].current, info: game.info, status: game.status});
					
				}
			});
		});
	});
});

server.listen(PORT, HOST);
