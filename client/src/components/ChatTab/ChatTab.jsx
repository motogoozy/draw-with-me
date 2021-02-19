import React, { useState, useEffect, useRef } from 'react';
import styles from './ChatTab.module.scss';
import TabStyles from '../../styles/Tab.module.scss';
import Message from '../Message/Message';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';

export default function ChatTab(props) {
  const [message, setMessage] = useState('');
  const { showChatTab, setShowChatTab, messages, sendMessage, currentUser } = props;
  const tabStyles = {
    [TabStyles.showTab]: showChatTab,
  };
  const messagesRef = useRef(null);

  useEffect(() => {
    if (showChatTab) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [showChatTab, messages]);

  const handleKeyDown = e => {
    if (e.keyCode === 13) {
      e.preventDefault();
      if (message) {
        sendMessage(message);
        setMessage('');
      }
    }
  };

  return (
    <div className={classnames(TabStyles.Tab, tabStyles)}>
      <div className={classnames(TabStyles.tabContainer, styles.chatTabContainer)}>
        <div className={TabStyles.tab} onClick={() => setShowChatTab(prev => !prev)}>
          <FontAwesomeIcon icon={faComments} />
        </div>
      </div>

      <div className={TabStyles.tabContent}>
        <div className={TabStyles.itemHeader} style={{ backgroundColor: '#663781', color: 'white' }}>
          Chat
        </div>
        <div className={classnames(TabStyles.itemContent, styles.chatContainer)}>
          <div className={styles.messageContainer} ref={messagesRef}>
            {messages &&
              messages.map((message, idx) => (
                <Message key={idx + message.username} {...message} currentUser={currentUser} />
              ))}
          </div>
          <div className={styles.chatInputContainer}>
            <textarea
              name='messageInput'
              id='messageInput'
              value={message}
              placeholder='Type your message here and hit enter to send'
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={() => {
                if (message) {
                  sendMessage(message);
                  setMessage('');
                }
              }}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
