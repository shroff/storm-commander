let SerialPort = require("serialport").SerialPort;
let StormTrooper = require("./storm-trooper");
let DeviceManager = require("./device-manager");
let DeviceInfo = require("./device-info");
let xbee = require('xbee');
let deviceCommands = {
  "rgbled": ["c", "p"],
}

let commandParams = {
  "c": [
    {
      "name": "color",
      "type": "color",
    },
    {
      "name": "duration",
      "type": "int",
      "default": 1000,
    },
  ],
  "p": [
    {
      "name": "color1",
      "type": "color",
    },
    {
      "name": "color2",
      "type": "color",
    },
    {
      "name": "duration",
      "type": "int",
      "default": 1000,
    },
  ]
}

const PREPARING = 0;
const READY = 1;
const ERROR = 2;

class StormCommander {
  constructor(port) {
    this.status = PREPARING;
    this.deviceManager = new DeviceManager();
    this._prepareSerial(port);
  }

  _prepareSerial(port) {
    var xbeeSerial = new SerialPort(port, {
      parser: xbee.packetParser()
    });

    xbeeSerial.on("open", () => {
      console.log("xbee serial port opened");
      this.status = READY;
    });

    xbeeSerial.on("error", () => {
      console.log("Error opening serial port");
      this.status = ERROR;
    });


    xbeeSerial.on("data", (packet) => {
      if (packet instanceof Array && packet[0] == xbee.FT_TRANSMIT_ACKNOWLEDGED) {
        // TODO: Wait for packet acknowledgement before sending successful response
        console.log("Received ack for frame " + packet[1]);
      } else if (packet.bytes && packet.bytes[0] == xbee.FT_RECEIVE_RF_DATA) {
        if (packet.raw_data[0] == 0x7f) {
          // Capability broadcast packet
          let id = packet.remote64.hex;
          let trooper = new StormTrooper(id, packet.remote64.dec, packet.remote16.dec);
          this.deviceManager.addTrooper(id, trooper, packet.raw_data.slice(1));
        } else {
          console.log("Unknown data packet");
          console.log(packet);
        }
      } else {
        console.log("Unknown xbee packet");
        console.log(packet);
      }
    });
    this.xbeeSerial = xbeeSerial;
  }

  getDevices() {
    return this.deviceManager.devices;
  }

  sendCommand(args) {
    let command = this._getCommand(args);
    let deviceInfo = this._getDeviceInfo(args);
    let trooper = this.deviceManager.getTrooper(deviceInfo.trooperId);
    this._validateCommand(command, deviceInfo);
    this.sendData(trooper, "command " + deviceInfo.index + " " + command.name + " " + command.params + "x\n");
  }

  sendData(trooper, data) {
    if (!trooper) {
      throw "Sending data, but trooper not specified: " + data;
    }
    if (!this.xbeeSerial.isOpen()) {
      console.log("Serial port is not open. Data: " + data);
      throw "Comms port is not open";
    }
    console.log("Transmitting to " + trooper.addr64);
    console.log("Data: " + data);

    var tx = new xbee.TransmitRFData();
    tx.destination64 = trooper.addr64;
    tx.destination16 = trooper.addr16;
    tx.RFData = data;

    this.xbeeSerial.write(tx.getBytes(), (err, bytesWritten) => {
      if (err) {
        console.log("Error: ", err.message);
      } else {
        console.log(bytesWritten, " bytes written");
      }
    });
  }


  _getCommand(args) {
    if (!("command" in args)) {
      throw "Command not specified";
    }
    let command = args.command;
    if (!command in commandParams) {
      throw "Parameters not known for command " + command;
    }

    var paramString = "";
    for (let param of commandParams[command]) {
      let value = (param.name in args) ? args[param.name] : param["default"];
      if (!value) {
        throw "No value found for required param " + param.name;
      }
      switch (param.type) {
        case "byte":
          let byteVal = value & 0xff;
          paramString += byteVal
          break;

        case "color":
          let color = parseInt(value, 16);
          // TODO: Make trooper accept 8-bit values instead of 7-bit
          let r = (color & 0xff0000) >> 17;
          let g = (color & 0xff00) >> 9;
          let b = (color & 0xff) >> 1;
          paramString += r + " " + g + " " + b;
          break;

        case "int":
        default:
          paramString += value;
          break;
      }

      paramString += " ";
    }

    if ("debug_command" in args) {
      throw "Constructed command: " + command + " " + paramString;
    }

    return {
      name: command,
      params: paramString
    };
  }

  _getDeviceInfo(args) {
    if (!("device" in args)) {
      throw "Missing device identifier";
    }
    let deviceId = parseInt(args.device);
    return this.deviceManager.getDeviceInfo(deviceId);
  }

  _validateCommand(command, deviceInfo) {
    if (!(deviceInfo.type in deviceCommands)) {
      throw "Unknown device type(" + deviceInfo.type + ") for device " + deviceInfo.index;
    }
    if (!deviceCommands[deviceInfo.type].includes(command.name)) {
      throw "Unknown command " + command + " for device of type " + deviceInfo.type;
    }
  }
}

module.exports = StormCommander;
