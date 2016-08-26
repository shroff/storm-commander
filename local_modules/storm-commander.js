var SerialPort = require("serialport").SerialPort;
var StormTrooper = require("./storm-trooper");
var xbee = require('xbee');
var xbeeSerial = new SerialPort("/dev/ttyUSB0", {
  parser: xbee.packetParser()
});

var troopers = {};
var trooperDescriptions = [];

deviceCommands = {
  "rgbled": ["c", "p"],
}

commandParams = {
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
var status = PREPARING;

xbeeSerial.on("open", function() {
  console.log("xbee serial port opened");
  status = READY;
});

xbeeSerial.on("error", function() {
  console.log("Error opening serial port");
  status = ERROR;
});

xbeeSerial.on("data", function(packet) {
  if (packet instanceof Array && packet[0] == xbee.FT_TRANSMIT_ACKNOWLEDGED) {
    // TODO: Wait for packet acknowledgement before sending successful response
    console.log("Received ack for frame " + packet[1]);
  } else if (packet.bytes && packet.bytes[0] == xbee.FT_RECEIVE_RF_DATA) {
    if (packet.raw_data[0] == 0x7f) {
      // Capability broadcast packet
      addr16hex = packet.remote16.hex;
      addr16 = packet.remote16.dec;
      addr64 = packet.remote64.dec;
      trooper = new StormTrooper(addr64, addr16, packet.raw_data.slice(1));
      if (!(addr16hex in troopers)) {
        console.log("Discovered trooper at " + addr16hex);
        console.log(packet);
        trooperDescriptions.push({
          address: addr16hex,
          devices: trooper.devices
        })
      }
      troopers[addr16hex] = trooper;
    } else {
      console.log("Unknown data packet");
      console.log(packet);
    }
  } else {
    console.log("Unknown xbee packet");
    console.log(packet);
  }
});

let getCommand = function(args) {
  if (!("command" in args)) {
    throw "Command not specified";
  }
  let command = args.command;
  if (!command in commandParams) {
    throw "Parameters not known for command " + command;
  }

  var paramString = "";
  for (param of commandParams[command]) {
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


let getDeviceInfo = function(args) {
  if (!(("trooper" in args) && ("device" in args))) {
    throw "Missing device identifier";
  }
  let trooperId = args.trooper;
  let device = parseInt(args.device);
  let trooper = troopers[trooperId];
  if (!trooper || trooper.devices.length <= device) {
    throw "Could not find device " + device + " on trooper " + trooperId;
  }
  return {
    trooper: trooper,
    index: device,
    type: trooper.devices[device].type,
  }
}
let validateCommand = function(command, deviceInfo) {
  if (!(deviceInfo.type in deviceCommands)) {
    throw "Unknown device type(" + deviceInfo.type + ") for device " + deviceInfo.index;
  }
  if (!deviceCommands[deviceInfo.type].includes(command.name)) {
    throw "Unknown command " + command + " for device of type " + deviceInfo.type;
  }
}

var sendCommand = function(args) {
  let command = getCommand(args);
  let deviceInfo = getDeviceInfo(args);
  validateCommand(command, deviceInfo);
  sendData(deviceInfo.trooper, "command " + deviceInfo.index + " " + command.name + " " + command.params + "x\n");
}

var sendData = function(trooper, data) {
  if (!trooper) {
    throw "Sending data, but trooper not specified: " + data;
  }
  if (!xbeeSerial.isOpen()) {
    console.log("Serial port is not open. Data: " + data);
    throw "Comms port is not open";
  }
  console.log("Transmitting to " + trooperId);
  console.log("Data: " + data);

  var tx = new xbee.TransmitRFData();
  tx.destination64 = trooper.addr64;
  tx.destination16 = trooper.addr16;
  tx.RFData = data;

  xbeeSerial.write(tx.getBytes(), function(err, bytesWritten) {
    if (err) {
      console.log("Error: ", err.message);
    } else {
      console.log(bytesWritten, " bytes written");
    }
  });
}

var getTrooperDescriptions = function() {
  return JSON.stringify(trooperDescriptions);
}

var StormCommander = {
  getTrooperDescriptions: getTrooperDescriptions,
  sendCommand: sendCommand,
  PREPARING: PREPARING,
  READY: READY,
  ERROR: ERROR
}

module.exports = StormCommander;
