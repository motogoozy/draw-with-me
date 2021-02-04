import React, { Component } from 'react';
import { CirclePicker } from 'react-color';

export default class ColorPicker extends Component {
  render() {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flexStart',
          alignItems: 'center',
        }}
        onClick={this.props.closeColorPicker}>
        <div onClick={event => event.stopPropagation()}>
          <CirclePicker
            onChange={e => this.props.handleColorChange(e)}
            colors={[
              '#000000',
              '#f44336',
              '#e91e63',
              '#9c27b0',
              '#673ab7',
              '#3f51b5',
              '#2196f3',
              '#03a9f4',
              '#00bcd4',
              '#009688',
              '#196919',
              '#4caf50',
              '#8bc34a',
              '#ffeb3b',
              '#ffc107',
              '#ff9800',
              '#ff5722',
              '#795548',
            ]}
          />
        </div>
      </div>
    );
  }
}
