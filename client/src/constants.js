const EVENTS = {
  CONNECTION: 'connection', // client connect
  DISCONNECT: 'disconnect', // client disconnect
  JOIN: 'join', // user join room
  LEAVE: 'leave', // user leaves room
  CLOSE: 'close', // room close
  DRAW: 'draw',
  CHAT: 'chat',
  CLEAR: 'clear',
  UNDO: 'undo', // undo most recent draw
  ERROR: 'error',
};

module.exports = {
  EVENTS,
};
