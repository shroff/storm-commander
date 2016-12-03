import React, { Component } from 'react';
import Device from './Device';

class DeviceList extends Component {
  render() {
    let devices = this.props.devices.map((device, i) => {
      return <Device key={device.id} device={device} />
    });
    return <div>
      {devices}
    </div>
  }
}

export default DeviceList;
