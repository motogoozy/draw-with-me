import React, { useState, useEffect } from 'react';
import './Join.scss';
import { generateID } from '../../utils';

export default function Join() {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [roomID, setRoomID] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    setUsername('');
  }, [showCreate, showJoin]);

  const generateRoomID = () => setRoomID(generateID(4));

  const joinRoom = (roomID, username) => {
    console.log(roomID, username);
    if (!roomID || !username) return;
    window.location.search = `?id=${roomID}&username=${username}`;
  };

  const handleKeyDown = (event, roomID, username) => {
    if (event.keyCode === 13) {
      joinRoom(roomID, username);
    }
  };

  return (
    <div className='join' onKeyDown={e => handleKeyDown(e, roomID, username)}>
      <div className='join-header'>
        {!showCreate && !showJoin && 'Welcome!'}
        {showCreate && 'Create Room'}
        {showJoin && 'Join Room'}
      </div>

      <div className='join-content'>
        {!showCreate && !showJoin && (
          <>
            <button
              onClick={() => {
                generateRoomID();
                setShowCreate(true);
                setShowJoin(false);
              }}>
              Create Room
            </button>
            <button
              onClick={() => {
                setRoomID('');
                setShowJoin(true);
                setShowCreate(false);
              }}>
              Join Room
            </button>
          </>
        )}

        {(showCreate || showJoin) && (
          <>
            <div className='room-info-container'>
              <p>Room ID:</p>
              {showCreate ? (
                <p>{roomID}</p>
              ) : (
                <input
                  type='text'
                  placeholder='Enter Room ID'
                  value={roomID}
                  onChange={e => setRoomID(e.target.value.toUpperCase())}
                  autoFocus
                />
              )}
            </div>
            <div className='username-container'>
              <p>Username:</p>
              <input
                type='text'
                placeholder='Enter Username'
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus={showCreate}
                maxLength={10}
              />
            </div>

            <button className='go-button' onClick={() => joinRoom(roomID, username)} disabled={!roomID || !username}>
              Let's Go!
            </button>
          </>
        )}

        {(showCreate || showJoin) && (
          <p
            className='back-button'
            onClick={() => {
              setShowCreate(false);
              setShowJoin(false);
            }}>
            Back
          </p>
        )}
      </div>
    </div>
  );
}
