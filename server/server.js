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

const connectedUsers = {}; // userID: {user}
const roomUsers = {}; // roomID: [...users]
const lineHistories = {}; // roomID: [...lineHistory]
const roomTimeouts = {}; // roomID: current timer
const restartTimer = roomID => {
  // clear and restart room timeout
  if (roomTimeouts[roomID]) {
    clearTimeout(roomTimeouts[roomID]);
  }
  const time = 1000 * 60 * 60; // 1 hour
  roomTimeouts[roomID] = setTimeout(() => {
    delete roomUsers[roomID];
    delete lineHistories[roomID];
  }, time);
};

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
    connectedUsers[userID] = user;
    roomUsers[roomID] = roomUsers[roomID] || [];
    roomUsers[roomID].push(user);
    io.to(roomID).emit('join room', user);

    if (lineHistories[roomID]) {
      // send the history to the new client
      lineHistories[roomID].forEach(line => socket.emit('draw', { ...line }));
    } else {
      lineHistories[roomID] = [];
    }

    restartTimer(roomID);
  });

  // handler for message type 'draw'
  socket.on('draw', lineData => {
    const { roomID } = lineData;

    if (lineHistories.hasOwnProperty(roomID)) {
      // add received line to history
      lineHistories[roomID].push(lineData);
      // send line to all clients
      io.to(roomID).emit('draw', lineData);
    } else {
      socket.emit('draw', { error: 'Room does not exist' });
    }

    restartTimer(roomID);
  });

  // handler for clearing drawing
  socket.on('clear', payload => {
    const { roomID } = payload;
    lineHistories[roomID] = [];
    io.emit('clear', true);

    restartTimer(roomID);
  });

  // handler for disconnect
  socket.on('disconnect', () => {
    delete connectedUsers[userID];
  });
});

// start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
