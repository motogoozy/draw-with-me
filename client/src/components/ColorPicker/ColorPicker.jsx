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
          <CirclePicker onChange={e => this.props.handleColorChange(e)} />
        </div>
      </div>
    );
  }
}
