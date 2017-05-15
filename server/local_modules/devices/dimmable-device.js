let Device = require("./device");

class DimmableDevice extends Device {
  static type() {
    return "dimmable";
  }
  constructor(index) {
    super(index, DimmableDevice.type(), {
      brightness: 255,
    })
  }
}

module.exports = DimmableDevice;
