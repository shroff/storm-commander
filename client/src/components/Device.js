import React, { Component } from 'react';

class Device extends Component {
  render() {
    let device = this.props.device;
    return <div>
      <pre>{JSON.stringify(device)}</pre>
    </div>
  }
}

export default Device;
