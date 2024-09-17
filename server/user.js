const axios = require('axios');

const users = {};

module.exports.onConnect = function (user_id, socket_id){
	if ( ! users[user_id] ) {
		users[user_id] = [];
	}
	
	users[user_id].push(socket_id);
}

module.exports.onDisconnect = (user_id, socket_id) => {
	if ( users[user_id] ) {
		users[user_id].splice(users[user_id].indexOf(socket_id), 1);
		
		if ( !users[user_id].length ) {
			delete users[user_id];
		}
	}
}

module.exports.onMessage = (io, recipient_id, event, data) => {

	const socket_ids = users[recipient_id.toString()] || [];

	for (let i=0; i<socket_ids.length; i++) {
		io.to(socket_ids[i]).emit('message', {event, data});
	}
}

module.exports.verifySocketConnection = (payload, callback) =>{
	
	const {AUTH_ORIGIN, AUTH_ACTION} = process.env;

	payload.action = AUTH_ACTION;
	const data = new URLSearchParams();
	
	for ( let k in payload ) {
		data.append(k, payload[k]);
	}

	axios
		.post(
			AUTH_ORIGIN, 
			data, 
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}
		)
		.then((response) => {
			callback(response.data?.success===true);
		})
		.catch((error) => {
			callback(false);
		});
}

