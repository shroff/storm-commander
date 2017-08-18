import React, { Component } from 'react';

class DimmableDevice extends Component {
  constructor(props) {
    super(props);
  }

  handleOn(component) {
    this.sendCommand('on');
  }
  handleOff(component) {
    this.sendCommand('off');
  }

  sendCommand(command) {
    fetch('/api/command', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          device: this.props.deviceId,
          command: command,
        })
    })
  }

  render() {
    return (
      <div>
      <button onClick={this.handleOn.bind(this)}>On</button>
      <button onClick={this.handleOff.bind(this)}>Off</button>
      </div>
    );
  }
}

export default DimmableDevice;
