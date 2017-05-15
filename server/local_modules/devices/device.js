class Device {
  constructor(index, type, state) {
    this.index = index;
    this.type = type;
    this.state = state;
  }

  generateCommandString(command) {
    throw "Unable to generate command string for " + command;
  }
}

module.exports = Device;
