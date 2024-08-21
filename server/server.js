// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const configs = require('./config.json');
const { onConnect, onDisconnect, onMessage } = require('./user');

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

	// To Do: Verify if request ID is generated from PHP
	if ( request_id ) {
		socket.on('message', ({recipient_id, event, data}) => {
			onMessage(io, recipient_id, event, data);
		});
	}

	if (!isNaN(mateup_user_id)) {
			
		onConnect(mateup_user_id, socket.id);
	
		// Handle client disconnect
		socket.on('disconnect', () => {
			onDisconnect(mateup_user_id, socket.id);
		});
	}
});

// Start the server and listen on a specified port
server.listen(configs.port, () => {
    console.log(`Server is running on port ${configs.port}`);
});
