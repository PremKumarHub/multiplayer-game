// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Create an Express app and an HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Game variables
let scores = {}; // Stores player scores
const WINNING_SCORE = 10; // Score required to win the game

// Handle new connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Initialize player's score
    scores[socket.id] = 0;

    // Notify all players about updated scores
    io.emit('update-scores', scores);

    // Handle click events from players
    socket.on('player-click', () => {
        if (scores[socket.id] !== undefined) {
            scores[socket.id] += 1;

            // Broadcast updated scores to all players
            io.emit('update-scores', scores);

            // Check if the player wins
            if (scores[socket.id] >= WINNING_SCORE) {
                io.emit('game-over', socket.id); // Notify everyone about the winner
            }
        }
    });

    // Handle player disconnections
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        delete scores[socket.id]; // Remove the player from the scores
        io.emit('update-scores', scores); // Update scores for all remaining players
    });
});

// Start the server
server.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
});
