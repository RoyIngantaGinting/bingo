exports.getDBCredential = function(){
	if (process.env.VCAP_SERVICES){
		// appfog
		var env = JSON.parse(process.env.VCAP_SERVICES);
		var mongo = env['mongodb-1.8'][0]['credentials'];
	} else {
		// localhost
		var mongo = {hostname: 'localhost', port: 27017, db: 'bingodb'};
	}
	return mongo;
};
exports.getMailCredential = function(){
	return {
		service: "Gmail",
		auth: {
			user: "royingantaginting@gmail.com",
			pass: ""
		}
	}
}