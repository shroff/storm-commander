import React, { Component } from 'react';
import InputRange from 'react-input-range';

class DimmableDevice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 100
    }
  }

  handleValueChange(component, value) {
    this.setState({
      value: value,
    });
  }

  handleSet(component) {
    this.setValue(this.state.value);
  }
  handleOff(component) {
    this.setValue(0);
  }

  setValue(value) {
    fetch('/api/command', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          device: this.props.deviceId,
          command: "b",
          value: Math.round(value * 255 / 100) + ""
        })
    })
  }

  render() {
    return (
      <div>
      <InputRange
        maxValue={100}
        minValue={0}
        value={this.state.value}
        onChange={this.handleValueChange.bind(this)}
      />
      <button onClick={this.handleSet.bind(this)}>Set</button>
      <button onClick={this.handleOff.bind(this)}>Off</button>
      </div>
    );
  }
}

export default DimmableDevice;
