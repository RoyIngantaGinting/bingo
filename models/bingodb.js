/**
 * Bingo mongo db operation
 */

function get_mongo_credentials(){
	if (process.env.VCAP_SERVICES){
		var env = JSON.parse(process.env.VCAP_SERVICES);
		var mongo = env['mongodb-1.8'][0]['credentials'];
	} else {
		var mongo = {hostname: 'localhost', port: 27017, db: 'bingodb'};
	}
	return mongo;
}
/*
function generate_mongo_url(obj){
	obj.hostname = (obj.hostname || 'localhost');
	obj.port = (obj.port || 27017);
	obj.db = (obj.db || 'bingodb');
	
	if (obj.username && obj.password){
		return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
	} else {
		return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
	}
}*/

exports.mongodb = require('mongodb');
exports.dbObj = {host: 'localhost', port: 27017, name: 'bingodb'};
exports.collections = ['pemain', 'permainan'];

var instance = null
	,connection = null;

exports.addPlayer = function(pid, name, email, password, callback){
	var pemain = {_id: pid, name: name, email: email, password: password}
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
	var mongo = get_mongo_credentials();
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
	exports.getDbInstance();
	
	if (connection == null){
		instance.open(function(err, db){
			connection = db;
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
},
	
exports.isFunc = function(name){
	var func = typeof name === "function" ? true : false;
	return func;
}