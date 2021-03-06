/**
 * Bingo mongo db operation
 */

exports.mongodb = require('mongoskin');
exports.dbObj = {host: 'localhost', port: 27017, name: 'bingodb'};
exports.collections = ['pemain', 'permainan', 'invitation'];

var instance = null
	,connection = null;

exports.addInvitation = function(invitation, callback){
	exports.insert(2, invitation, callback);
};

exports.getInvitation = function(key, callback){
	var invitation = {key: key, active: true};

	exports.selectOne(2, invitation, callback);
};

exports.updateInvitation = function(key, callback){
	var where = {key: key}
		invitation = {active: false};
	
	exports.update(2, invitation, where, callback);
}

exports.getInvitationByUser = function(user, callback){
	var invitation = {by: user}
		,option = {};
	
	exports.selectAdvance(2, invitation, option, callback);
}

exports.addPlayer = function(pid, name, email, password, callback){
	var pemain = {_id: pid, name: name, email: email, password: password, limit: 5}
		, index = 0;
	
	exports.insert(index, pemain, callback);
};

exports.getPlayer = function(pemain, callback){
	var index = 0;
	exports.selectOne(index, pemain, callback);
};

exports.updatePlayer = function(pid, data, callback){
	var where = {_id: pid}
		, index = 0;
	
	exports.update(index, data, where, callback);
}

exports.createGame = function(gid, info, callback){
	var game = {_id : gid, info: info, status: 'creating', winner: '', current: 0}
		, index = 1;

	exports.insert(index, game, callback);
};

exports.getGame = function(gid, callback){
	var game = {_id: gid}
		, index = 1;
	
	exports.selectOne(index, game, callback);
}

exports.getAGame = function(game, callback){
	exports.selectOne(1, game, callback);
}

exports.listGame = function(limit, skip, callback){
	var game = {status: 'waiting'}
		,index = 1
		,option = {limit: limit, skip: skip};
		
	exports.selectAdvance(index, game, option, callback);
}

exports.updateGame = function(gid, data, callback){
	var index = 1, where = {_id: gid};
	
	exports.update(index, data, where, callback);
}

exports.updateSpesificGame = function(where, data, callback){
	exports.update(1, data, where, callback);
}

exports.insert = function(index, data, callback){
	var collectionName = exports.collections[index]
		, isFunc = exports.isFunc;
	
	exports.templateOperation(
		collectionName
		, function( err, collection, db)
		{
			collection.insert(
				data, 
				function( err, result )
				{
					if (isFunc(callback)){
						callback( err, result );
					}
				}
			);
		}
		, callback
	);
};

exports.selectAdvance = function(index, where, option, callback){
	var collectionName = exports.collections[index]
		isFunc = exports.isFunc;

	exports.templateOperation(
		collectionName
		, function( err, collection, db )
		{
			collection.find( where, option, function (err, doc){
				// db.close();
				if (isFunc(callback)){
					callback(err, doc);
				}
			})
		}
		, callback
	);
}

exports.select = function(index, where, callback){
	var collectionName = exports.collections[index]
		isFunc = exports.isFunc;

	exports.templateOperation(
		collectionName
		, function( err, collection, db )
		{
			collection.find( where, function (err, doc){
				// db.close();
				if (isFunc(callback)){
					callback(err, doc);
				}
			})
		}
		, callback
	);
};
	
exports.selectOne = function(index, where, callback){
	var collectionName = exports.collections[index]
		isFunc = exports.isFunc;

	exports.templateOperation(
		collectionName
		, function( err, collection, db )
		{
			collection.findOne( where, function (err, doc){
				// db.close();
				if (isFunc(callback)){
					callback(err, doc);
				}
			})
		}
		, callback
	);
};
	
exports.update = function(index, data, where, callback){
	var collectionName = exports.collections[index]
		, isFunc = exports.isFunc;
	
	exports.templateOperation(
		collectionName
		, function( err, collection, db )
		{
			collection.update(
				where, 
				{$set: data},
				{safe: true}, 
				function(err, result){
					db.close();
					if ( isFunc(callback) ){
						callback(err, result);
					}
				});
		},
		callback);
};
	
/**
 * Private Method
 */
// get a new database transport. Should only be used internally.
exports.getDbInstance = function(){
	var mongo = require('../config').getDBCredential();
		
	var server = new exports.mongodb.Server(
			mongo.hostname,
			mongo.port,
			{ auto_reconnect: true }
		);
	
	if (instance == null){
		instance = new exports.mongodb.Db(
				mongo.db,
				server,
				{safe: true}
			);
	}
},
	
// Template operation against mongo db
exports.templateOperation = function(collectionName, operation, callback){
	var mongo = require('../config').getDBCredential();
	
	exports.getDbInstance();
	if (connection == null){
		instance.open(function(err, db){
			connection = db;
			if (mongo.username && mongo.password){
				connection.authenticate(mongo.username, mongo.password, function(errauth, datauth){
					connection.collection(
						collectionName
						, { safe: true }
						, function(err, collection)
						{
							operation(err, collection, connection);
						}
					);
				});
			} else {
				connection.collection(
					collectionName
					, { safe: true }
					, function(err, collection)
					{
						operation(err, collection, connection);
					}
				);
			}
		});
	} else {
		connection.collection(
				collectionName
				, { safe: true }
				, function(err, collection)
				{
					operation(err, collection, connection);
				}
			);
	}
},
	
exports.isFunc = function(name){
	var func = typeof name === "function" ? true : false;
	return func;
}