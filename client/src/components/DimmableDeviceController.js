import React, { Component } from 'react';
import { Button, Modal } from 'semantic-ui-react';
import InputRange from 'react-input-range'

class DimmableDevice extends Component {
  
  constructor(props) {
    super(props);
    let brightness = Math.round(props.device.state.brightness * 100 / 255);
    this.state = {
      'brightnessModalOpen': false,
      'brightness': brightness,
      'newBrightness': brightness,
    }
  }

  handleBrightnessValueChange(component, value) {
    this.setState({
      'newBrightness': value,
    });
  }

  handleBrightnessChangeCancel(component) {
    this.setState({
      'brightnessModalOpen': false,
      'newBrightness': this.state.brightness,
    });
  }

  handleBrightnessChangeAccept(component) {
    this.setState({
      'brightnessModalOpen': false,
      'brightness': this.state.newBrightness,
    });
    fetch('/api/update_state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        device: this.props.device.id,
        name: 'brightness',
        value: Math.round(this.state.newBrightness * 255 / 100),
      })
    })
  }

  handleChangeBrightness(component) {
    this.setState({
      'brightnessModalOpen': true,
    });
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
        device: this.props.device.id,
        command: command,
      })
    })
  }

  render() {
    let buttonText = 'Change Brightness (' + this.state.brightness + ')';
    return (
      <div>
        <Modal open={this.state.brightnessModalOpen}>
          <Modal.Header>Select a Photo</Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <InputRange
                maxValue={100}
                minValue={0}
                value={this.state.newBrightness}
                onChange={this.handleBrightnessValueChange.bind(this)}
              />
            </Modal.Description>
            <Modal.Actions>
              <Button content='Cancel' onClick={this.handleBrightnessChangeCancel.bind(this)} />
              <Button primary content='OK' onClick={this.handleBrightnessChangeAccept.bind(this)}/>
            </Modal.Actions>
          </Modal.Content>
        </Modal>
        <Button onClick={this.handleChangeBrightness.bind(this)}>{buttonText}</Button>
        <Button onClick={this.handleOn.bind(this)}>On</Button>
        <Button onClick={this.handleOff.bind(this)}>Off</Button>
      </div>
    );
  }
}

export default DimmableDevice;
