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
  }

  generateCommandString(command) {
    if (command === "on") {
      return commandGenerator.generateCommandString(
        'b',
        {
          'value': this.state.brightness,
        }
      );
    }
    if (command === "off") {
      return commandGenerator.generateCommandString(
        'b',
        {
          'value': 0,
        }
      );
    }
    return super.generateCommandString(command);
  }
}

module.exports = DimmableDevice;
