import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import queryString from 'query-string';

export default function Canvas() {
  const socketRef = useRef();
  let queryStrings = queryString.parse(window.location.search);
  const { id: roomID, username } = queryStrings;

  useEffect(() => {
    let mouse = {
      click: false,
      move: false,
      position: { x: 0, y: 0 },
      prevPosition: false,
    };
    // const roomID = generateID(16);
    const joinPayload = {
      roomID,
      username,
    };

    // connect to socket, get canvas element, and create context
    socketRef.current = io.connect('/');
    socketRef.current.emit('join room', joinPayload);
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
    socketRef.current.on('draw', data => {
      if (data.error) {
        console.log(data.error);
        window.location.search = '';
      } else {
        const { line } = data;
        context.strokeStyle = '#FF0000';
        context.beginPath();
        context.moveTo(line[0].x * width, line[0].y * height);
        context.lineTo(line[1].x * width, line[1].y * height);
        context.stroke();
      }
    });

    // alert when user joins room
    socketRef.current.on('join room', newUser => {
      if (newUser.username === username) {
        console.log(`Welcome, ${username}!`);
      } else {
        console.log(`${newUser.username} has joined the room!`);
      }
    });

    // clear canvas
    socketRef.current.on('clear', () => {
      context.clearRect(0, 0, width, height);
      console.log('canvas cleared');
    });

    // main loop, running every 25ms
    function main() {
      // check if the use is drawing
      if (mouse.click && mouse.move && mouse.prevPosition) {
        // send line to the server
        const drawPayload = {
          roomID,
          line: [mouse.position, mouse.prevPosition],
        };
        socketRef.current.emit('draw', drawPayload);
        mouse.move = false;
      }
      mouse.prevPosition = { x: mouse.position.x, y: mouse.position.y };
    }

    setInterval(main, 25);
  }, [roomID, username]);

  function clearCanvas() {
    const clearPayload = {
      roomID,
    };
    socketRef.current.emit('clear', clearPayload);
  }
  return (
    <div className='canvas-container'>
      <canvas id='drawing' className='canvas'></canvas>
      <button className='clear-canvas' onClick={clearCanvas}>
        Clear
      </button>
    </div>
  );
}
