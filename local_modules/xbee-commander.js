let SerialPort = require('serialport').SerialPort;
let xbee = require('xbee');
let EventEmitter = require('events');
let StormTrooper = require('./storm-trooper');

class XbeeCommander extends EventEmitter {
  constructor(port) {
    super();
    let xbeeSerial = new SerialPort(port, {
      parser: xbee.packetParser()
    });

    xbeeSerial.on('open', () => {
      console.log('xbee serial port opened');
    });

    xbeeSerial.on('error', () => {
      console.log('Error opening serial port');
    });

    xbeeSerial.on('data', (packet) => {
      if (packet instanceof Array && packet[0] == xbee.FT_TRANSMIT_ACKNOWLEDGED) {
        // TODO: Wait for packet acknowledgement before sending successful response
        console.log('Received ack for frame ' + packet[1]);
      } else if (packet.bytes && packet.bytes[0] == xbee.FT_RECEIVE_RF_DATA) {
        if (packet.raw_data[0] == 0x7f) {
          // Capability broadcast packet
          let id = packet.remote64.hex;
          let trooper = new StormTrooper(id, packet.remote64.dec, packet.remote16.dec);
          this.emit('newTrooper', id, trooper,packet.raw_data.slice(1));
        } else {
          console.log('Unknown data packet');
          console.log(packet);
        }
      } else {
        console.log('Unknown xbee packet');
        console.log(packet);
      }
    });

    this.xbeeSerial = xbeeSerial;
  }

  sendData(trooper, data) {
    if (!trooper) {
      throw 'Sending data, but trooper not specified: ' + data;
    }
    if (!this.xbeeSerial.isOpen()) {
      console.log('Serial port is not open. Data: ' + data);
      throw 'Comms port is not open';
    }
    console.log('Transmitting to ' + trooper.addr64);
    console.log('Data: ' + data);

    var tx = new xbee.TransmitRFData();
    tx.destination64 = trooper.addr64;
    tx.destination16 = trooper.addr16;
    tx.RFData = data;

    this.xbeeSerial.write(tx.getBytes(), (err, bytesWritten) => {
      if (err) {
        console.log('Error: ', err.message);
      } else {
        console.log(bytesWritten, ' bytes written');
      }
    });
  }
}

module.exports = XbeeCommander;
