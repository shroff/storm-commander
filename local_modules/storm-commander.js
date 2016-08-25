var SerialPort = require("serialport").SerialPort;
var StormTrooper = require("./storm-trooper");
var xbee = require('xbee');
var xbeeSerial = new SerialPort("/dev/ttyUSB0", {
  parser: xbee.packetParser()
});

var troopers = {};
var trooperDescriptions = [];

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

var sendCommand = function(trooperId, device, command, params) {
  if (!(trooperId in troopers)) {
    return "Could not find trooper with id " + trooperId;
  }
  let tropper = troopers[trooperId]
  if (trooper.devices.length <= device) {
    return "Could not find device " + device + " on trooper " + trooperId;
  }

  let cmd = command + (params ? " " + params : "");
  sendData(trooperId, "command " + device + " " + cmd + " x\n");
  return null;
}

var sendData = function(trooperId, data) {
  if (!((trooperId in troopers) && xbeeSerial.isOpen())) {
    console.log("Could not transmit to " + trooperId);
    console.log("Data: " + data);
    return false;
  }
  var trooper = troopers[trooperId];
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

var setColor = function(trooper, device, r, g, b, duration) {
  let params = r + " " + g + " " + b + " " + duration;
  return sendCommand(trooper, device, "c", params);
}

var pulse = function(trooper, device, r1, g1, b1, r2, g2, b2, duration) {
  let params = r1 + " " + g1 + " " + b1 + " " + r2 + " " + g2 + " " + b2 + " " + duration;
  return sendCommand(trooper, device, "p", params);
}

var StormCommander = {
  getTrooperDescriptions: getTrooperDescriptions,
  setColor: setColor,
  pulse: pulse,
  PREPARING: PREPARING,
  READY: READY,
  ERROR: ERROR
}

module.exports = StormCommander;
