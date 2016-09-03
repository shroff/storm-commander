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
    this.deviceMap = {};
    this.devices = [];
    for (let id in this.troopers) {
      let trooper = this.troopers[id];
      trooper.addr16 = [0xff, 0xfe];
      for (let device of trooper.devices) {
        this.deviceMap[device.id] = device;
        this.devices.push({
          name: device.name,
          type: device.type,
          id: device.id,
        });
      }
    }
    console.log(this.deviceMap);

    this.xbeeCommander = new XBeeCommander(serialPort)
    this.xbeeCommander.on('newTrooper', (id, trooper, devices) => {
      let existingDevices = (id in this.troopers) ? this.troopers[id].devices : [];
      let diff = deviceMatcher.match(existingDevices, devices);
      trooper.devices = diff.remaining.concat(diff.added);
      this.troopers[id] = trooper;
      console.log('Trooper discovered: ');
      console.log(trooper);

      if (this._updateDevices(diff, id)) {
        console.log("Troopers Updated");
        console.log(diff);
        console.log((this.troopers));
        save(JSON.stringify({
          id: this.id,
          deviceCounter: this.deviceCounter,
          troopers: this.troopers,
        }));
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

  _updateDevices(diff, trooperId) {
    let removedIds = diff.removed.map((device) => {
      return device.id;
    });

    // Update the devices array
    this.devices = this.devices.filter(function(device) {
      return !removedIds.includes(device.id);
    });
    this.devices = this.devices.concat(diff.added.map((device) => {
      device.id = this.deviceCounter++;
      device.trooperId = trooperId;
      return {
        id: device.id,
        type: device.type,
        name: device.name,
      };
    }));
    
    // Update the device map
    for (let removedId of removedIds) {
      delete this.deviceMap[removedId];
    }

    for (let addedDevice of diff.added) {
      this.deviceMap[addedDevice.id] = addedDevice;
    }
    return (diff.added.length > 0) || (diff.removed.length > 0);
  }
}

module.exports = StormCommander;
