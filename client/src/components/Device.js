import React, { Component } from 'react';
import { Header } from 'semantic-ui-react';
import DimmableDeviceController from './DimmableDeviceController';

import '../css/Device.css'

class Device extends Component {
  render() {
    let device = this.props.device;
    var controller = null;

    if (device.type === "dimmable") {
      controller = <DimmableDeviceController />
    } else {
      controller = <div>
        Unknown Type <span className='mono'> {device.type} </span>
      </div>;
    }

    return (
      <div className="device">
        <Header as='h2' className={'name' + device.name ? '' : ' anonymous'}>
          {device.name ? device.name : "Anonymous Device"}
        </Header>
        {controller}
      </div>
    );
  }
}

export default Device;
