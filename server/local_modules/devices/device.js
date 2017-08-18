class Device {
  constructor(index, type, state) {
    this.index = index;
    this.type = type;
    this.state = state;
  }

  generateCommandString(command) {
    throw "Unrecognized command for device type " + this.type + ": " + command;
  }

  updateState(name, value) {
    if (name !== 'name') {
      throw "Trying to update unrecognized state " + name + " to " + value;
    }
    this.state[name] = value
  }
}

module.exports = Device;
