const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
require('dotenv').config();
const { EVENTS } = require(path.join(__dirname, '../client', '/src', 'constants.js'));

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
    io.in(roomID).emit(EVENTS.CLOSE);
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
io.on(EVENTS.CONNECTION, socket => {
  const { id } = socket;

  // handle room join
  socket.on(EVENTS.JOIN, payload => {
    const { roomID, username } = payload;
    const user = { id, username };

    socket.join(roomID);
    connectedUsers[id] = user;
    const room = _getRoom(roomID); // join existing room or create one
    room.users.push(user);
    io.in(roomID).emit(EVENTS.JOIN, user);

    // send line & chat histories to the new client
    if (room.lineHistory.length > 0) {
      room.lineHistory.forEach(line => socket.emit(EVENTS.DRAW, line));
    }
    if (room.chatHistory.length > 0) {
      room.chatHistory.forEach(msg => socket.emit(EVENTS.CHAT, msg));
    }

    rooms[roomID] = room;
    _restartTimer(roomID);
  });

  // handle draw
  socket.on(EVENTS.DRAW, linePayload => {
    const { roomID } = linePayload;

    if (rooms[roomID]) {
      // add received line to history
      rooms[roomID].lineHistory.push(linePayload);
      // send line to all clients
      io.in(roomID).emit(EVENTS.DRAW, linePayload);
    } else {
      socket.emit(EVENTS.DRAW, { error: 'Room does not exist' });
    }

    _restartTimer(roomID);
  });

  // handle chat
  socket.on(EVENTS.CHAT, messagePayload => {
    const { roomID } = messagePayload;

    if (rooms[roomID]) {
      // add message to history
      rooms[roomID].chatHistory.push(messagePayload);
      // send msg to all clients
      io.in(roomID).emit(EVENTS.CHAT, messagePayload);
    }

    _restartTimer(roomID);
  });

  // handle clear drawing
  socket.on(EVENTS.CLEAR, roomID => {
    rooms[roomID].lineHistory = [];
    io.in(roomID).emit(EVENTS.CLEAR, true);

    _restartTimer(roomID);
  });

  // handler for disconnect
  socket.on(EVENTS.DISCONNECT, () => {
    const { username } = connectedUsers[id];
    io.emit(EVENTS.LEAVE, username);
    delete connectedUsers[id];
  });
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
