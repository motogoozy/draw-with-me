const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
require('dotenv').config();

// create server
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// environment
const PORT = process.env.PORT || 4000;
const BUILD_DIR = path.join(__dirname, '../client', 'build')

// expose static files
app.use(express.static(BUILD_DIR));

// SOCKETS
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
  socket.on('draw', linePayload => {
    const { roomID } = linePayload;

    if (rooms[roomID]) {
      // add received line to history
      rooms[roomID].lineHistory.push(linePayload);
      // send line to all clients
      io.to(roomID).emit('draw', linePayload);
    } else {
      socket.emit('draw', { error: 'Room does not exist' });
    }

    restartTimer(roomID);
  });

  // handler for chat
  socket.on('chat', messagePayload => {
    const { roomID } = messagePayload;

    if (rooms[roomID]) {
      // add message to history
      rooms[roomID].chatHistory.push(messagePayload);
      // send msg to all clients
      io.to(roomID).emit('chat', messagePayload);
    }

    restartTimer(roomID);
  });

  // handler for clearing drawing
  socket.on('clear', roomID => {
    rooms[roomID].lineHistory = [];
    io.emit('clear', true);

    restartTimer(roomID);
  });

  // handler for disconnect
  socket.on('disconnect', () => {
    delete connectedUsers[userID];
  });
});

// return SPA entry point
app.get('/', (req, res) => {
  res.sendFile(path.join(BUILD_DIR, 'index.html'), (err) => console.log(err));
})

// error handler
app.use((err, req, res, next) => {
  if (!err) {
    next();
  } else {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Unknown error';
    res.status(statusCode).send(message);
  }
})

// start server
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
