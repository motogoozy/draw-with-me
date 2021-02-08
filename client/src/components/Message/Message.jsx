import React from 'react';
import styles from './Message.module.scss';
import classnames from 'classnames';

export default function Message(props) {
  const { username, message, currentUser } = props;

  const messageStyles = {
    [styles.isAuthor]: username === currentUser,
  };

  const containerStyles = {
    [styles.padLeft]: username === currentUser,
  };

  return (
    <div className={classnames(styles.container, containerStyles)}>
      {username !== currentUser && <p className={styles.username}>{username}</p>}
      <p className={classnames(styles.message, messageStyles)}>{message}</p>
    </div>
  );
}
