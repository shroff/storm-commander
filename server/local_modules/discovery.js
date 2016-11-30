var dgram = require('dgram');
const DISCOVERY_PORT = 39764;
const DISCOVERY_GROUP = "239.254.254.1";

class Discovery {
  constructor() {
    this.server = null;
  }

  start(commander_port) {
    if (this.server) {
      return;
    }

    let server = dgram.createSocket('udp4');

    server.on('error', (err) => {
      console.log(`Discovery server error:\n${err.stack}`);
      server.close();
      this.server = null;
    });

    server.on('listening', () => {
      let address = server.address();
      console.log(`Discovery server listening ${address.address}:${address.port}`);
      server.addMembership(DISCOVERY_GROUP);
      server.send('ping', DISCOVERY_PORT, DISCOVERY_GROUP);
    });

    server.on('message', (msg, rinfo) => {
      console.log(`Discovery server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
      if (msg == 'ping') {
        let reply = `pong ${commander_port}`;
        server.send(reply, DISCOVERY_PORT, DISCOVERY_GROUP);
        console.log(`Discovery server replying with ${reply}`);
      }
    });

    server.bind(DISCOVERY_PORT);
    this.server = server;
  }
}

module.exports = Discovery;
