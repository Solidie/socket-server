// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const { onConnect, onDisconnect, onMessage, verifySocketConnection } = require('./user');

const configs = require('dotenv').config({path: path.resolve(__dirname, '../.env')}).parsed;
configs.CORS_ORIGIN = configs.CORS_ORIGIN.split(' ');

// Initialize the Express app
const app = express();

// Create an HTTP server and pass the Express app
const server = http.createServer(app);

// Initialize Socket.io and configure CORS options
const io = socketIo(server, {
    cors: {
        origin: configs.CORS_ORIGIN,
        methods: ["GET", "POST"], // Allow only these methods
        credentials: true // Allow cookies to be sent with requests
    }
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Listen for client connections on the 'connection' event
io.on('connection', (socket) => {

	const {user_id, nonce, nonce_action} = socket.handshake?.query || {};

	verifySocketConnection({user_id, nonce, nonce_action}, (success)=>{

		// Disconnect socket if nonce verfication failed
		if ( ! success ) {
			socket.disconnect(true);
			return;
		}
	
		onConnect(user_id, socket.id);
	
		socket.on('message', ({recipient_id, event, data}) => {
			onMessage(io, recipient_id, event, data);
		});

		// Handle client disconnect
		socket.on('disconnect', () => {
			onDisconnect(user_id, socket.id);
		});
	});
});

// Start the server and listen on a specified port
server.listen(configs.PORT, () => {
    console.log(`Server is running on port ${configs.PORT}`);
});
