import React from 'react';
import styles from './ChatTab.module.scss';
import TabStyles from '../../styles/Tab.module.scss';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';

export default function ChatTab(props) {
  const { showChatTab, setShowChatTab } = props;
  const tabStyles = {
    [TabStyles.showTab]: showChatTab,
  };

  return (
    <div className={classnames(TabStyles.Tab, tabStyles)}>
      <div className={classnames(TabStyles.tabContainer, styles.chatTabContainer)}>
        <div className={TabStyles.tab} onClick={() => setShowChatTab(prev => !prev)}>
          <FontAwesomeIcon icon={faComments} />
        </div>
      </div>

      <div className={TabStyles.tabContent}>
        <div className={classnames(TabStyles.tabMenuItem, styles.colorPickerContainer)}>
          <div className={TabStyles.itemHeader}>Chat</div>
          <div className={TabStyles.itemContent}></div>
        </div>
      </div>
    </div>
  );
}
