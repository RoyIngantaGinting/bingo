exports.sendJSONResponse = function(res, object){
	res.type('json');
	//console.log('response', JSON.stringify(object));
	res.end(JSON.stringify(object));
};

exports.getMongoUrl = function(obj){
	var temp = '';
	
	obj.hostname = (obj.hostname || 'localhost');
	obj.port = (obj.port || 27017);
	obj.db = (obj.db || 'bingodb');
	
	if (obj.username && obj.password){
		temp = obj.username + ":" + obj.password + "@";
	}
	return temp + obj.hostname + ":" + obj.port + "/" + obj.db;
}