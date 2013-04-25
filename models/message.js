exports.getDefaultErrorMsg = function(){
	return {status: "error", code: 123, msg: "Invalid request"};
}
exports.getEmailRegisteredMsg = function(){
	return {status: 'error', code: 113, msg: 'Can not use same email for multiple account'};
}
exports.getInvitationLimitMsg = function(){
	return {status: 'error', code: 114, msg: 'You have reached your invitation limit'};
}
exports.getInvitationSendMsg = function(){
	return {status: 'ok', code: 204, msg: 'Invitation has been send successfully'};
}
exports.getServerErrorMsg = function(){
	return {status: "error", code: 100, msg: "Server error"};
}
exports.getSignupMsg = function(){
	return {status: 'ok', code: 203, msg: 'New User has been added successfully'};
};
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