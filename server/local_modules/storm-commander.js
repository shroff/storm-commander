let fs = require("fs");
let deviceMatcher = require("./device-matcher");
let XBeeCommander = require("./xbee-commander");
let util = require("util");

class StormCommander {
  constructor(serialPort, saveFilePath) {
    let data = this.readDevicesJson(saveFilePath);
    this.id = (data && data.id) ? data.id : Math.floor(Math.random() * 1e10);
    this.deviceCounter = (data && data.deviceCounter) ? data.deviceCounter : 0;
    this.troopers = (data && data.troopers) ? data.troopers : {};
    this._recomputeDevices(true);
    console.log(this.deviceMap);

    this.save = function() {
      fs.writeFile(saveFilePath, JSON.stringify({
        id: this.id,
        deviceCounter: this.deviceCounter,
        troopers: this.troopers,
      }));
    }

    this.xbeeCommander = new XBeeCommander(serialPort)
    this.xbeeCommander.on("newTrooper", (id, trooper, devices, frame) => {
      let existingDevices = (id in this.troopers) ? this.troopers[id].devices : [];
      let diff = deviceMatcher.match(existingDevices, devices);
      trooper.devices = diff.remaining.concat(diff.added);
      if (id in this.troopers && trooper.addr16 != this.troopers[id].addr16) {
        console.log("Local Address of %s changed from %s to %s", id, this.troopers[id].addr16, trooper.addr16);
      }
      this.troopers[id] = trooper;

      if (this._updateDeviceMap(diff, id)) {
        this._recomputeDevices();
        console.log("Troopers Updated");
        console.log(util.inspect(frame, { depth: null }));
        console.log(util.inspect(diff, { depth: null }));
        console.log(util.inspect(this.troopers, { depth: null }));
        this.save();
      }
    });
  }

  readDevicesJson(filePath) {
    var exists = false;
    try {
      fs.statSync(filePath);
      exists = true;
    } catch (err) { }

    if (exists) {
      fs.accessSync(filePath, fs.constants.R_OK | fs.constants.W_OK);
      return JSON.parse(fs.readFileSync(filePath))
    }
    return null;
  }

  getDevices() {
    return this.devices;
  }

  sendCommand(deviceId, command, debug) {
    let device = this._getDevice(deviceId);
    let trooper = this._getTrooper(device.trooperId);
    let commandString = device.generateCommandString(command);
    if (debug) {
      console.log('generated command: ' + commandString);
    }
    this.xbeeCommander.sendData(trooper, "command " + device.index + " " + commandString + " x\n");
  }

  updateState(deviceId, name, value, debug) {
    let device = this._getDevice(deviceId);
    let command = device.updateState(name, value);
    if (debug) {
      console.log('updating ' + name + ' to ' + value);
    }
    if (command) {
      this.sendCommand(deviceId, command, debug);
    }
    this.save();
  }

  _getDevice(deviceId) {
    if (deviceId in this.deviceMap) {
      return this.deviceMap[deviceId];
    }
    throw "Unknown Device ID: " + deviceId;
  }

  _getTrooper(trooperId) {
    if (trooperId in this.troopers) {
      return this.troopers[trooperId];
    }
    throw "Unknown Trooper ID: " + trooperId;
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
        trooper.devices = trooper.devices.map((device) => {
          let newDevice = deviceMatcher.createDevice(device.index, device.type);
          newDevice.state = device.state;
          newDevice.id = device.id;
          newDevice.trooperId = device.trooperId;
          return newDevice;
        });
      }
      for (let device of trooper.devices) {
        if (reconstruct) {
          this.deviceMap[device.id] = device;
        }
        this.devices.push({
          id: device.id,
          type: device.type,
          state: device.state,
        });
      }
    }
  }
}

module.exports = StormCommander;
