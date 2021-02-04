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
const rooms = {}; // keyed by roomID, values are objects with users, lineHistory, chatHistory, timeouts;
const restartTimer = roomID => {
  // clear and restart room timeout
  if (rooms[roomID].timeout) {
    clearTimeout(rooms[roomID].timeout);
  }
  const time = 1000 * 60 * 60; // 1 hour
  rooms[roomID].timeout = setTimeout(() => {
    delete rooms[roomID];
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
    rooms[roomID] = rooms[roomID] || {};
    rooms[roomID].users = rooms[roomID].users || [];
    rooms[roomID].users.push(user);
    rooms[roomID].lineHistory = rooms[roomID].lineHistory || [];
    rooms[roomID].chatHistory = rooms[roomID].chatHistory || [];
    io.to(roomID).emit('join room', user);

    // send line & chat histories to the new client
    if (rooms[roomID].lineHistory.length > 0) {
      rooms[roomID].lineHistory.forEach(line => socket.emit('draw', line));
    }
    if (rooms[roomID].chatHistory.length > 0) {
      rooms[roomID].chatHistory.forEach(msg => socket.emit('chat', msg));
    }

    restartTimer(roomID);
  });

  // handler for draw
  socket.on('draw', lineData => {
    const { roomID } = lineData;

    if (rooms[roomID]) {
      // add received line to history
      rooms[roomID].lineHistory.push(lineData);
      // send line to all clients
      io.to(roomID).emit('draw', lineData);
    } else {
      socket.emit('draw', { error: 'Room does not exist' });
    }

    restartTimer(roomID);
  });

  // handler for chat
  socket.on('chat', msgData => {
    const { roomID } = msgData;

    if (rooms[roomID]) {
      // add message to history
      rooms[roomID].chatHistory.push(msgData);
      // send msg to all clients
      io.to(roomID).emit('chat', msgData);
    }

    restartTimer(roomID);
  });

  // handler for clearing drawing
  socket.on('clear', payload => {
    const { roomID } = payload;
    rooms[roomID].lineHistory = [];
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
