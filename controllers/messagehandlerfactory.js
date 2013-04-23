exports.messageHandlerFactory = function(){

	function getHandler(data, io, socket){
		var messages = data.split("::")
			, message = messages[1]
			, command = messages[0];
		
		if (command.match(/^create$/)){
			return new exports.CreateHandler(message, io, socket);
		} else if (command.match(/^join$/)){
			return new exports.JoinHandler(message, io, socket);
		} else if (command.match(/^cross$/)){
			return new exports.CrossHandler(message, io, socket);
		}
	}
}

exports.CreateHandler = require('./createhandler');

exports.JoinHandler = require('./joinhandler');

exports.CrossHandler = requires('./crosshandler');
