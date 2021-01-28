let socket;

function clearCanvas() {
  socket.emit('clear', true);
}

document.addEventListener('DOMContentLoaded', () => {
  let mouse = {
    click: false,
    move: false,
    position: { x: 0, y: 0 },
    prevPosition: false,
  };

  // connect to socket, get canvas element, and create context
  socket = io.connect();
  let canvas = document.getElementById('drawing');
  let context = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;

  // set canvas to full browser height/width
  canvas.width = width;
  canvas.height = height;

  // register mouse event handlers
  canvas.onmousedown = () => (mouse.click = true);
  canvas.onmouseup = () => (mouse.click = false);
  canvas.onmousemove = e => {
    // normalize mouse position to range 0.0 - 1.0
    mouse.position.x = e.clientX / width;
    mouse.position.y = e.clientY / height;
    mouse.move = true;
  };

  // draw line received from server
  socket.on('draw', data => {
    const { line } = data;
    context.beginPath();
    context.moveTo(line[0].x * width, line[0].y * height);
    context.lineTo(line[1].x * width, line[1].y * height);
    context.stroke();
  });

  // clear canvas
  socket.on('clear', () => {
    context.clearRect(0, 0, width, height);
    console.log('canvas cleared');
  });

  // main loop, running every 25ms
  function main() {
    // check if the use is drawing
    if (mouse.click && mouse.move && mouse.prevPosition) {
      // send line to the server
      socket.emit('draw', { line: [mouse.position, mouse.prevPosition] });
      mouse.move = false;
    }
    mouse.prevPosition = { x: mouse.position.x, y: mouse.position.y };
  }

  setInterval(main, 25);
});
