let commandParser = require('./command-parser');
let commandValidator = require('./command-validator');
let deviceMatcher = require('./device-matcher');
let XBeeCommander = require('./xbee-commander');
let util = require('util');

class StormCommander {
  constructor(serialPort, save, data) {
    this.id = (data && data.id) ? data.id : Math.floor(Math.random() * 1e10);
    this.deviceCounter = (data && data.deviceCounter) ? data.deviceCounter : 0;
    this.troopers = (data && data.troopers) ? data.troopers : {};
    this._recomputeDevices(true);
    console.log(this.deviceMap);

    this.save = function() {
      save(JSON.stringify({
        id: this.id,
        deviceCounter: this.deviceCounter,
        troopers: this.troopers,
      }));
    }

    this.xbeeCommander = new XBeeCommander(serialPort)
    this.xbeeCommander.on('newTrooper', (id, trooper, devices, frame) => {
      let existingDevices = (id in this.troopers) ? this.troopers[id].devices : [];
      let diff = deviceMatcher.match(existingDevices, devices);
      trooper.devices = diff.remaining.concat(diff.added);
      if (id in this.troopers && trooper.addr16 != this.troopers[id].addr16) {
        console.log('Local Address of ' + id + ' changed from ' + this.troopers[id].addr16 + ' to ' + trooper.addr16);
      }
      this.troopers[id] = trooper;

      if (this._updateDeviceMap(diff, id)) {
        this._recomputeDevices();
        console.log('Troopers Updated');
        console.log(util.inspect(frame, { depth: null }));
        console.log(util.inspect(diff, { depth: null }));
        console.log(util.inspect(this.troopers, { depth: null }));
        this.save();
      }
    });
  }

  getDevices() {
    return this.devices;
  }

  sendCommand(args) {
    let command = commandParser.parse(args);
    let device = this._getDevice(args);
    let trooper = this._getTrooper(device.trooperId);
    commandValidator.validate(device, command);
    this.xbeeCommander.sendData(trooper, 'command ' + device.index + ' ' + command.name + ' ' + command.params + 'x\n');
  }

  renameDevice(args) {
    let device = this._getDevice(args);
    device.name = args.name ? args.name : null;
    console.log('Renamed Device:');
    console.log(device);
    this._recomputeDevices();
    this.save();
  }

  _getDevice(args) {
    if (!('device' in args)) {
      throw 'Missing device identifier';
    }
    let deviceId = parseInt(args.device);
    if (deviceId in this.deviceMap) {
      return this.deviceMap[deviceId];
    }
    throw 'Unknown Device ID: ' + deviceId;
  }

  _getTrooper(trooperId) {
    if (trooperId in this.troopers) {
      return this.troopers[trooperId];
    }
    throw 'Unknown Trooper ID: ' + trooperId;
  }

  _updateDeviceMap(diff, trooperId) {
    
    // Update the device map
    for (let removedDevice of diff.removed) {
      delete this.deviceMap[removedDevice.id];
    }
    for (let addedDevice of diff.added) {
      addedDevice.id = this.deviceCounter++;
      addedDevice.trooperId = trooperId;
      this.deviceMap[addedDevice.id] = addedDevice;
    }

    return (diff.added.length > 0) || (diff.removed.length > 0);
  }

  _recomputeDevices(reconstruct) {
    if (reconstruct) {
      this.deviceMap = {};
    }
    this.devices = [];
    for (let id in this.troopers) {
      let trooper = this.troopers[id];
      if (reconstruct) {
        trooper.addr16 = [0xff, 0xfe];
      }
      for (let device of trooper.devices) {
        if (reconstruct) {
          this.deviceMap[device.id] = device;
        }
        this.devices.push({
          id: device.id,
          type: device.type,
          name: device.name,
        });
      }
    }
  }
}

module.exports = StormCommander;
