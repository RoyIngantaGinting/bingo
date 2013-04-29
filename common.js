exports.sendJSONResponse = function(res, object){
	res.type('json');
	//console.log('response', JSON.stringify(object));
	res.end(JSON.stringify(object));
};