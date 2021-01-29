const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
require('dotenv').config();

// create server
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// expose static files
app.use(express.static(path.join(__dirname, '../client', 'public')));

const users = {};
const roomUsers = {};
const lineHistories = {};

// client connection
io.on('connection', socket => {
  const userID = socket.id;
  // handler for joining rooms
  socket.on('join room', payload => {
    const { roomID, username } = payload;
    const user = {
      id: userID,
      username,
    };

    socket.join(roomID);
    users[userID] = user;
    roomUsers[roomID] = roomUsers[roomID] || [];
    roomUsers[roomID].push(user);
    io.to(roomID).emit('join room', user);

    if (lineHistories[roomID]) {
      // send the history to the new client
      lineHistories[roomID].forEach(line => socket.emit('draw', { line }));
    } else {
      lineHistories[roomID] = [];
    }
  });

  // handler for message type 'draw'
  socket.on('draw', payload => {
    const { roomID, line } = payload;
    const user = users[userID];
    // add received line to history
    lineHistories[roomID].push(line);
    // send line to all clients
    io.to(roomID).emit('draw', { line, user });
  });

  // handler for joining room

  // handler for clearing drawing
  socket.on('clear', () => {
    line_history = [];
    io.emit('clear', true);
  });

  // handler for disconnect
  socket.on('disconnect', () => {});
});

// start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
