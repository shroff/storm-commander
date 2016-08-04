var SerialPort = require("serialport").SerialPort;
var xbee = new SerialPort("/dev/ttyUSB0");

const PREPARING = 0;
const READY = 1;
const ERROR = 2;
var status = PREPARING;

xbee.on("open", function() {
  console.log("XBee serial port opened");
  status = READY;
});
xbee.on("error", function() {
  console.log("Error opening serial port");
  status = ERROR;
});
var sendCommand = function(cmd) {
  if (xbee.isOpen()) {
    xbee.write(cmd + " x\n", function(err, bytesWritten) {
      console.log("Command sent: " + cmd);
      if (err) {
        console.log("Error: ", err.message);
      } else {
        console.log(bytesWritten, " bytes written");
      }
    });
  }
}

var setColor = function(r, g, b, duration) {
  var cmd = "command 0 c " + r + " " + g + " " + b + " " + duration;
  sendCommand(cmd);
}

var pulse = function(r1, g1, b1, r2, g2, b2, duration) {
  var cmd = "command 0 p " + r1 + " " + g1 + " " + b1 + " " + r2 + " " + g2 + " " + b2 + " " + duration;
  sendCommand(cmd);
}

var StormCommander = {
  setColor: setColor,
  pulse: pulse,
  PREPARING: PREPARING,
  READY: READY,
  ERROR: ERROR
}

module.exports = StormCommander;
