const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
require('dotenv').config();
const { EVENTS } = require(path.join(__dirname, '../client', '/src', 'constants.js'));
const { CONNECTION, DISCONNECT, JOIN, LEAVE, CLOSE, DRAW, CHAT, CLEAR, ERROR } = EVENTS;

// create server
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// environment
const PORT = process.env.PORT || 4000;
const BUILD_DIR = path.join(__dirname, '../client', 'build');

// expose static files
app.use(express.static(BUILD_DIR));

// SOCKETS
const connectedUsers = {}; // { id: {user} }
const rooms = {}; // { id: { id, users: [], lineHistory: [], chatHistory: [], timeout }}

const _restartTimer = roomID => {
  // clear and restart room timeout
  if (rooms[roomID].hasOwnProperty('timeout')) {
    clearTimeout(rooms[roomID].timeout);
  }
  const time = 1000 * 60 * 60; // 1 hour
  rooms[roomID].timeout = setTimeout(() => {
    io.in(roomID).emit(CLOSE);
    delete rooms[roomID];
  }, time);
};

const _getRoom = id => {
  if (rooms[id]) return rooms[id];
  return {
    id,
    users: [],
    lineHistory: [],
    chatHistory: [],
  };
};

// client connection
io.on(CONNECTION, socket => {
  const { id } = socket;

  // Handlers
  const _handleJoin = payload => {
    try {
      const { roomID, username } = payload;
      const user = { id, username };

      socket.join(roomID);
      connectedUsers[id] = user;
      const room = _getRoom(roomID); // join existing room or create one
      room.users.push(user);
      io.in(roomID).emit(JOIN, user);

      // send line & chat histories to the new client
      if (room.lineHistory.length > 0) {
        room.lineHistory.forEach(line => socket.emit(DRAW, line));
      }
      if (room.chatHistory.length > 0) {
        room.chatHistory.forEach(msg => socket.emit(CHAT, msg));
      }

      rooms[roomID] = room;
      _restartTimer(roomID);
    } catch (e) {
      console.log(e);
      socket.emit(ERROR, { msg: 'Join error' });
    }
  };

  const _handleDraw = linePayload => {
    try {
      const { roomID } = linePayload;

      if (rooms[roomID]) {
        // add received line to history
        rooms[roomID].lineHistory.push(linePayload);
        // send line to all clients
        io.in(roomID).emit(DRAW, linePayload);
      } else {
        socket.emit(ERROR, { msg: 'Room does not exist', forceLeave: true });
      }

      _restartTimer(roomID);
    } catch (e) {
      console.log(e);
      socket.emit(ERROR, { msg: 'Draw error' });
    }
  };

  const _handleChat = messagePayload => {
    try {
      const { roomID } = messagePayload;

      if (rooms[roomID]) {
        // add message to history
        rooms[roomID].chatHistory.push(messagePayload);
        // send msg to all clients
        io.in(roomID).emit(CHAT, messagePayload);
      }

      _restartTimer(roomID);
    } catch (e) {
      console.log(e);
      socket.emit(ERROR, { msg: 'Chat error' });
    }
  };

  const _handleClear = roomID => {
    try {
      rooms[roomID].lineHistory = [];
      io.in(roomID).emit(CLEAR, true);

      _restartTimer(roomID);
    } catch (e) {
      console.log(e);
      socket.emit(ERROR, { msg: 'Error clearing canvas' });
    }
  };

  const _handleDisconnect = () => {
    try {
      const { username } = connectedUsers[id];
      io.emit(LEAVE, username);
      delete connectedUsers[id];
    } catch (e) {
      console.log(e);
      socket.emit(ERROR, { msg: 'Error disconnecting' });
    }
  };

  // Listeners
  socket.on(JOIN, _handleJoin);
  socket.on(DRAW, _handleDraw);
  socket.on(CHAT, _handleChat);
  socket.on(CLEAR, _handleClear);
  socket.on(DISCONNECT, _handleDisconnect);
});

// return SPA entry point
app.get('/', (req, res) => {
  res.sendFile(path.join(BUILD_DIR, 'index.html'), err => console.log(err));
});

// error handler
app.use((err, req, res, next) => {
  if (!err) {
    next();
  } else {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Unknown error';
    res.status(statusCode).send(message);
  }
});

// start server
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
