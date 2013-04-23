var db = require('./BingoDB');

exports = module.exports = CreateHandler;

function CreateHandler(message, io, socket){
	var room = message;
	
	if (exports.isMessageValid(message)){
		socket.get('room', function(err, oldRoom){
			if (err) throw err;
			if (oldRoom){
				console.log("oldroom", oldRoom);
				socket.leave(oldRoom);
			}

			socket.set('room', room, function(err){
				if (err) throw err;
				console.log("newRoom", room);
				socket.join(room);
			});
		});
	} else {
		var err = {message: 'invalid message', code: 301};
		socket.send(JSON.stringify(err));
	}
}

exports.isMessageValid = function(message){
	
}