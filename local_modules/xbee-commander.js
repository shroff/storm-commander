let SerialPort = require('serialport').SerialPort;
var xbee_api = require('xbee-api');
var C = xbee_api.constants;
let EventEmitter = require('events');
let StormTrooper = require('./storm-trooper');

class XbeeCommander extends EventEmitter {
  constructor(port) {
    super();
    let xbee = new xbee_api.XBeeAPI();
    let xbeeSerial = new SerialPort(port, {
      parser: xbee.rawParser()
    });

    // Serial Port Opened
    xbeeSerial.on('open', () => {
      console.log('xbee serial port opened');
    });

    // Serial Port Error
    xbeeSerial.on('error', (err) => {
      console.log('Error opening serial port', err);
    });

    // Checksum error
    xbee.on('error', (err) => {
      console.log(err);
    });

    xbee.on('frame_object', (frame) => {
      if (frame.type == C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET) {
        if (frame.data[0] == 0x7f) {
          // Capability broadcast packet
          let id = frame.remote64;
          let trooper = new StormTrooper(id, frame.remote64, frame.remote16);
          this.emit('newTrooper', id, trooper, frame.data.slice(1));
        } else {
          console.log('Unknown stormy data packet');
          console.log(frame.data);
        }
      } else if (frame.type == C.FRAME_TYPE.ZIGBEE_TRANSMIT_STATUS) {
        if (frame.deliveryStatus == C.DELIVERY_STATUS.SUCCESS) {
          console.log('Frame ' + frame.id + ' delivered ');
        } else {
          console.log('Delivery Failed');
          console.log(frame);
        }
      } else {
        console.log('Unknown xbee frame');
        console.log(frame);
      }
    });

    xbee.on('raw_frame', (rawFrame) => {
      console.log('Unrecognized frame:');
      console.log(rawFrame);
    });

    this.xbeeSerial = xbeeSerial;
    this.xbee = xbee;
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

    let id = this.xbee.nextFrameId();

    var tx = {
      type: C.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST,
      id: id,
      destination64: trooper.addr64,
      destination16: trooper.addr16,
      data: data,
    }

    console.log('Sending Frame ' + id);

    this.xbeeSerial.write(this.xbee.buildFrame(tx), (err, bytesWritten) => {
      if (err) {
        console.log('Error: ', err.message);
      } else {
        console.log(bytesWritten, ' bytes written');
      }
    });
  }
}

module.exports = XbeeCommander;
