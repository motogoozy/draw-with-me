const express = require('express');
const socketio = require('socket.io');
const path = require('path');
require('dotenv').config();

// start webserver
const port = process.env.PORT || 8080;
const app = express();
const server = app.listen(port);
const io = socketio(server);

// expose static files
app.use(express.static(path.join(__dirname, '/public')));
console.log(`Server listening on port ${port}`);

// array of all lines drawn
const lineHistory = [];

// event handler for new incoming connections
io.on('connection', socket => {
  // first send the history to the new client
  lineHistory.forEach(line => socket.emit('draw', { line }));

  // handler for message type 'draw'
  socket.on('draw', data => {
    // add received lin eto history
    lineHistory.push(data.line);
    // send line to all clients
    io.emit('draw', { line: data.line });
  });

  // handler for clearing drawing
  socket.on('clear', () => {
    line_history = [];
    io.emit('clear', true);
  });
});
