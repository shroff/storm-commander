class Device {
  constructor(index, type, state) {
    this.index = index;
    this.type = type;
    this.state = state;
  }

  generateCommandString(command) {
    throw "Unrecognized command for device type " + this.type + ": " + command;
  }
}

module.exports = Device;
