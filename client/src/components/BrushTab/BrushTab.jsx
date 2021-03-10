import React from 'react';
import styles from './BrushTab.module.scss';
import TabStyles from '../../styles/Tab.module.scss';
import classnames from 'classnames';
import ColorPicker from '../ColorPicker/ColorPicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaintBrush } from '@fortawesome/free-solid-svg-icons';

export default function BrushTab(props) {
  const {
    showBrushTab,
    setShowBrushTab,
    handleColorChange,
    handleBrushSizeChange,
    currentBrushSize,
    currentColor,
  } = props;
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

        <p style={{ width: '90%', height: '1px', backgroundColor: 'lightgray', marginBottom: '1rem' }} />

        <div className={classnames(styles.brushSizeContainer)}>
          <div className={TabStyles.itemHeader}>Size</div>
          <div className={TabStyles.itemContent}>
            <div className={styles.sliderContainer}>
              <input
                type='range'
                className={styles.sizeSlider}
                value={currentBrushSize}
                onChange={handleBrushSizeChange}
                id='brush-size'
                name='brush-size'
                min='1'
                max='100'
                step='0.5'
              />
            </div>

            <div className={styles.brushContainer}>
              <div
                className={styles.brush}
                style={{
                  height: `${currentBrushSize}px`,
                  width: `${currentBrushSize}px`,
                  backgroundColor: `${currentColor}`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
