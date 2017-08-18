import React, { Component } from 'react';
import { Header } from 'semantic-ui-react';
import DimmableDeviceController from './DimmableDeviceController';

import '../css/Device.css'

class Device extends Component {
  render() {
    let device = this.props.device;
    console.log(device);
    var controller = null;

    if (device.type === "dimmable") {
      controller = <DimmableDeviceController deviceId={this.props.device.id}/>
    } else {
      controller = <div>
        Unknown Type <span className='mono'> {device.type} </span>
      </div>;
    }

    return (
      <div className="device">
        <Header as='h2' className={'name' + device.state.name ? '' : ' anonymous'}>
          {device.state.name ? device.state.name : "Anonymous Device"}
        </Header>
        {controller}
      </div>
    );
  }
}

export default Device;
