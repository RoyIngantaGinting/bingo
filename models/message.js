exports.getDefaultErrorMsg = function(){
	return {status: "error", code: 123, msg: "Invalid request"};
}
exports.getServerErrorMsg = function(){
	return {status: "error", code: 100, msg: "Server error"};
}
exports.getDefaultOkMsg = function(){
	return {status: "ok", code: 200, msg: "Request succes"};
}
exports.getLoginFailMsg = function(){
	return {status: "error", code: 111, msg: "Credential Mismatch"};
}
exports.getChPasswdFailMsg = function(){
	return {status: 'error', code: 112, msg: 'Unmatch password'};
}
exports.getChPasswdSuccessMsg = function(){
	return {status: 'ok', code: 201, msg: 'Password has been change successfully'};
}
exports.getQuitMessage = function(){
	return {status: 'ok', code: 202, msg: 'You left successfully'};
}
exports.STATUS_WAITING = 'waiting';
exports.STATUS_CREATING = 'creating';
exports.STATUS_PLAYING = 'playing';
exports.STATUS_END = 'end';