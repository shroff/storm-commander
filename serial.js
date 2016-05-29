var SerialPort = require("serialport").SerialPort;
var xbee = new SerialPort("/dev/ttyUSB0");

xbee.on("open", function() {
  console.log("XBee serial port opened");
  xbee.write("c 127 127 127 x\n", function(err, bytesWritten) {
    if (err) {
      console.log("Error: ", err.message);
    } else {
      console.log(bytesWritten, " bytes written");
    }
  });
});

