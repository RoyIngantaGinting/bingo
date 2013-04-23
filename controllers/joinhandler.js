
exports = module.exports = JoinHandler;

function JoinHandler(message, io, socket){
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
}