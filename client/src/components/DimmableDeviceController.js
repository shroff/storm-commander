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

  render() {
    return (
      <InputRange
        maxValue={100}
        minValue={0}
        value={this.state.value}
        onChange={this.handleValueChange.bind(this)}
      />
    );
  }
}

export default DimmableDevice;
