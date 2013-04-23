exports.isCreatePlayerReq = function( req ){
	var valid = false;
	if (exports.checkName(req) && exports.checkEmail(req) && exports.checkPassword(req)){
		valid = true;
	}
	return valid;
}

exports.isResetPasswordReq = function( req ){
	return exports.checkEmail(req);
}

exports.isLoginReq = function( req ){
	var valid = false;
	if (exports.checkPassword(req) && exports.checkEmail(req)){
		valid = true;
	}
	return valid;
}

exports.isFilled = function(component){
	return component && component.trim().length > 0;
}

exports.checkName = function( req ){
	return exports.isFilled( req.body.name );
}

exports.checkEmail = function( req ){
	return exports.isFilled( req.body.email );
}

exports.checkPassword = function( req ){
	return exports.isFilled( req.body.password );
}