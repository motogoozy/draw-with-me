import React from 'react';
import styles from './InfoTab.module.scss';
import classnames from 'classnames';
import ColorPicker from '../ColorPicker/ColorPicker';

export default function InfoTab(props) {
  const { showInfoTab, setShowInfoTab, handleColorChange } = props;
  const tabStyles = {
    [styles.showTab]: showInfoTab,
  };

  return (
    <div className={classnames(styles.infoTab, tabStyles)}>
      <div className={styles.tabContainer}>
        <div className={styles.tab} onClick={() => setShowInfoTab(prev => !prev)}></div>
      </div>

      <div className={styles.tabContent}>
        <div className={classnames(styles.tabMenuItem, styles.colorPickerContainer)}>
          <div className={styles.itemHeader}>Select Color</div>
          <div className={styles.itemContent}>
            <ColorPicker handleColorChange={handleColorChange} />
          </div>
        </div>

        <div className={classnames(styles.tabMenuItem, styles.roomUsersContainer)}>
          <div className={styles.itemHeader}>Users In Room</div>
          <div className={styles.itemContent}></div>
        </div>
      </div>
    </div>
  );
}
