var dgram = require('dgram');
const DISCOVERY_PORT = 39764;
const DISCOVERY_GROUP = "239.254.254.1";

const INACTIVE = 0;
const LISTENING = 1;
const ERROR = 2;
var status = INACTIVE;

var start = function(commander_port) {
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
    server.addMembership(DISCOVERY_GROUP);
    server.send("ping", DISCOVERY_PORT, DISCOVERY_GROUP);
  });

  server.on('message', (msg, rinfo) => {
    console.log(`Discovery server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    if (msg == "ping") {
      var reply = `pong ${commander_port}`;
      server.send(reply, DISCOVERY_PORT, DISCOVERY_GROUP);
    console.log(`Discovery server replying with ${reply}`);
    }
  });

  status = LISTENING;
  server.bind(DISCOVERY_PORT);
}

var Discovery = {
  start: start
};

module.exports = Discovery;
