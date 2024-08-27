// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { onConnect, onDisconnect, onMessage } = require('./user');

const configs = {
	"port": 8081,
	"origin": ["http://10.0.2.2", "http://localhost", "http://localhost:10034", "https://mate.solidie.com"]
}

// Initialize the Express app
const app = express();

// Create an HTTP server and pass the Express app
const server = http.createServer(app);

// Initialize Socket.io and configure CORS options
const io = socketIo(server, {
    cors: {
        origin: configs.origin,
        methods: ["GET", "POST"], // Allow only these methods
        credentials: true // Allow cookies to be sent with requests
    }
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Listen for client connections on the 'connection' event
io.on('connection', (socket) => {

	const {mateup_user_id} = socket.handshake?.query || {};
	const {token: request_id} = socket.handshake?.auth || {};

	console.log('connected', socket.id);

	// To Do: Verify if request ID is generated from PHP
	if ( request_id ) {
		socket.on('message', ({recipient_id, event, data}) => {
			onMessage(io, recipient_id, event, data);
		});
	} else if (!isNaN(mateup_user_id)) {
			
		onConnect(mateup_user_id, socket.id);
	
		// Handle client disconnect
		socket.on('disconnect', () => {
			onDisconnect(mateup_user_id, socket.id);
		});
	} else {
		socket.disconnect(true);
	}
});

// Start the server and listen on a specified port
server.listen(configs.port, () => {
    console.log(`Server is running on port ${configs.port}`);
});
