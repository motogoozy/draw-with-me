import React, { useState, useEffect, useRef } from 'react';
import './Canvas.scss';
import io from 'socket.io-client';
import queryString from 'query-string';
import BrushTab from '../BrushTab/BrushTab';
import ChatTab from '../ChatTab/ChatTab';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { EVENTS } from '../../constants.js';

export default function Canvas() {
  const socketRef = useRef();
  const brushRef = useRef({ color: '#000000', size: 5 });
  let queryStrings = queryString.parse(window.location.search);
  const { id: roomID, username } = queryStrings;
  const [showBrushTab, setShowBrushTab] = useState(false);
  const [showChatTab, setShowChatTab] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentColor, setCurrentColor] = useState(brushRef.current.color);
  const [currentBrushSize, setCurrentBrushSize] = useState(brushRef.current.size);

  const handleColorChange = event => {
    brushRef.current.color = event.hex;
    setCurrentColor(event.hex);
  };

  const handleBrushSizeChange = event => {
    brushRef.current.size = event.target.value;
    setCurrentBrushSize(event.target.value);
  };

  const clearCanvas = () => socketRef.current.emit(EVENTS.CLEAR, roomID);

  const sendMessage = message => {
    const messagePayload = {
      roomID,
      username,
      message,
    };

    socketRef.current.emit(EVENTS.CHAT, messagePayload);
  };

  useEffect(() => {
    setCurrentBrushSize(brushRef.current.size);
  }, [brushRef.current.size]);

  useEffect(() => {
    let mouse = {
      click: false,
      move: false,
      position: { x: 0, y: 0 },
      prevPosition: false,
    };

    const joinPayload = {
      roomID,
      username,
    };

    // connect to socket, get canvas element, and create context
    socketRef.current = io.connect('/');
    socketRef.current.emit(EVENTS.JOIN, joinPayload);
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

    // register touch event handlers
    canvas.ontouchstart = e => {
      mouse.position.x = e.touches[0].clientX / width;
      mouse.position.y = e.touches[0].clientY / height;
      mouse.move = false;
      mouse.click = true;
    };
    canvas.ontouchend = e => {
      mouse.click = false;
    };
    canvas.ontouchmove = e => {
      // normalize mouse position to range 0.0 - 1.0
      mouse.position.x = e.touches[0].clientX / width;
      mouse.position.y = e.touches[0].clientY / height;
      mouse.move = true;
    };

    // draw line received from server
    socketRef.current.on(EVENTS.DRAW, lineData => {
      if (lineData.error) {
        console.log(lineData.error);
        window.location.search = '';
      } else {
        const { coordinates, color, size } = lineData;
        context.strokeStyle = color;
        context.lineWidth = size;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.beginPath();
        context.moveTo(coordinates[0].x * width, coordinates[0].y * height);
        context.lineTo(coordinates[1].x * width, coordinates[1].y * height);
        context.stroke();
      }
    });

    // alert when user joins room
    socketRef.current.on(EVENTS.JOIN, newUser => {
      if (newUser.username === username) {
        console.log(`Welcome, ${username}!`);
      } else {
        console.log(`${newUser.username} has joined the room`);
      }
    });

    socketRef.current.on(EVENTS.LEAVE, username => {
      console.log(`${username} has left the room`);
    });

    // clear canvas
    socketRef.current.on(EVENTS.CLEAR, () => {
      context.clearRect(0, 0, width, height);
      console.log('canvas cleared');
    });

    // receive chat message
    socketRef.current.on(EVENTS.CHAT, newMessage => {
      setMessages(prev => [...prev, newMessage]);
    });

    // close room
    socketRef.current.on(EVENTS.CLOSE, () => {
      console.log('room has been closed');
    });

    // TODO: undo last draw
    socketRef.current.on(EVENTS.UNDO, () => {});

    // main loop, running every 25ms
    function main() {
      // check if the use is drawing
      if (mouse.click && mouse.move && mouse.prevPosition) {
        // send line to the server
        const lineData = {
          coordinates: [mouse.position, mouse.prevPosition],
          color: brushRef.current.color,
          size: brushRef.current.size,
          roomID,
        };
        socketRef.current.emit(EVENTS.DRAW, lineData);
        mouse.move = false;
      }
      mouse.prevPosition = { x: mouse.position.x, y: mouse.position.y };
    }

    setInterval(main, 25);
  }, [roomID, username]);

  return (
    <div className='canvas-container'>
      <canvas id='drawing' className='canvas'></canvas>

      <BrushTab
        showBrushTab={showBrushTab}
        setShowBrushTab={setShowBrushTab}
        handleColorChange={handleColorChange}
        handleBrushSizeChange={handleBrushSizeChange}
        currentColor={currentColor}
        currentBrushSize={currentBrushSize}
      />

      <ChatTab
        showChatTab={showChatTab}
        setShowChatTab={setShowChatTab}
        messages={messages}
        sendMessage={sendMessage}
        currentUser={username}
      />

      <button className='leave-button' onClick={() => (window.location.search = '')}>
        <FontAwesomeIcon icon={faSignOutAlt} />
      </button>

      <button className='clear-canvas' onClick={clearCanvas}>
        <FontAwesomeIcon icon={faTrashAlt} />
      </button>
    </div>
  );
}
