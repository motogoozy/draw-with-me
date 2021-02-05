import React from 'react';
import styles from './Message.module.scss';
import classnames from 'classnames';

export default function Message(props) {
  const { username, message, currentUser } = props;
  console.log(username, currentUser);

  const messageStyles = {
    [styles.isAuthor]: currentUser === username,
  };

  const displayName = currentUser === username ? `${username} (Me)` : username;

  return (
    <div className={styles.container}>
      <p className={styles.username}>{displayName}</p>
      <p className={classnames(styles.message, messageStyles)}>{message}</p>
    </div>
  );
}
