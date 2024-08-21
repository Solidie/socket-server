const users = {};

module.exports.onConnect = function (user_id, socket_id){
	if ( ! users[user_id] ) {
		users[user_id] = [];
	}
	
	users[user_id].push(socket_id);

	console.log(users);
}

module.exports.onDisconnect = (user_id, socket_id) => {
	if ( users[user_id] ) {
		users[user_id].splice(users[user_id].indexOf(socket_id), 1);
		
		if ( !users[user_id].length ) {
			delete users[user_id];
		}
	}

	console.log(users);
}

module.exports.onMessage = (io, recipient_id, event, data) => {

	const socket_ids = users[recipient_id.toString()] || [];


	console.log(recipient_id, data);
	console.log(socket_ids);
	
	for (let i=0; i<socket_ids.length; i++) {
		io.to(socket_ids[i]).emit('message', {event, data});
	}
	
}
