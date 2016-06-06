var SerialPort = require("serialport").SerialPort;
var xbee = new SerialPort("/dev/ttyUSB0");

xbee.on("open", function() {
  console.log("XBee serial port opened");
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
  var cmd = "c " + r + " " + g + " " + b + " " + duration;
  sendCommand(cmd);
}

var pulse = function(r1, g1, b1, r2, g2, b2, duration) {
  var cmd = "p " + r1 + " " + g1 + " " + b1 + " " + r2 + " " + g2 + " " + b2 + " " + duration;
  sendCommand(cmd);
}

var StormTrooper = {
  "setColor": setColor,
  "pulse": pulse
}

module.exports = StormTrooper;
