let Device = require('./device');
let commandGenerator = require('../command-generator');

class DimmableDevice extends Device {
  static type() {
    return "dimmable";
  }

  constructor(index) {
    super(index, DimmableDevice.type(), {
      brightness: 255,
    })
    this.on = false;
  }

  generateCommandString(command) {
    if (command === 'on') {
      this.on = true;
      return commandGenerator.generateCommandString(
        'b',
        {
          'value': this.state.brightness,
        }
      );
    }
    if (command === 'off') {
      this.on = false;
      return commandGenerator.generateCommandString(
        'b',
        {
          'value': 0,
        }
      );
    }
    return super.generateCommandString(command);
  }

  updateState(name, value) {
    if (name === 'brightness') {
      // TODO: validate value
      this.state[name] = parseInt(value);
      if (this.on) {
        return 'on';
      }
      return null;
    }
    return super.updateState(name, value);
  }
}

module.exports = DimmableDevice;
