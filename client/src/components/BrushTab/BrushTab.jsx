import React from 'react';
import styles from './BrushTab.module.scss';
import TabStyles from '../../styles/Tab.module.scss';
import classnames from 'classnames';
import ColorPicker from '../ColorPicker/ColorPicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaintBrush } from '@fortawesome/free-solid-svg-icons';

export default function BrushTab(props) {
  const { showBrushTab, setShowBrushTab, handleColorChange } = props;
  const tabStyles = {
    [TabStyles.showTab]: showBrushTab,
  };

  return (
    <div className={classnames(TabStyles.Tab, tabStyles)}>
      <div className={classnames(TabStyles.tabContainer, styles.brushTabContainer)}>
        <div className={TabStyles.tab} onClick={() => setShowBrushTab(prev => !prev)}>
          <FontAwesomeIcon icon={faPaintBrush} />
        </div>
      </div>

      <div className={TabStyles.tabContent}>
        <div className={classnames(styles.colorPickerContainer)}>
          <div className={TabStyles.itemHeader}>Color</div>
          <div className={TabStyles.itemContent}>
            <ColorPicker handleColorChange={handleColorChange} />
          </div>
        </div>
      </div>
    </div>
  );
}
