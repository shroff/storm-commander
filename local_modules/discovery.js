var dgram = require('dgram');

const INACTIVE = 0;
const LISTENING = 1;
const ERROR = 2;
var status = INACTIVE;

var start = function() {
  if (status == LISTENING) {
    return;
  }

  var server = dgram.createSocket('udp4');

  server.on('error', (err) => {
    console.log(`Discovery server error:\n${err.stack}`);
    server.close();
    status = ERROR;
  });

  server.on('listening', () => {
    var address = server.address();
    console.log(`Discovery server listening ${address.address}:${address.port}`);
  });

  server.on('message', (msg, rinfo) => {
    console.log(`Discovery server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  });

  status = LISTENING;
  server.bind(39764);
}

var Discovery = {
  start: start
};

module.exports = Discovery;
