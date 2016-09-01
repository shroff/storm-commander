let DeviceInfo = require("./device-info");
let EventEmitter = require("events");
let deviceTypeMap = {
  0: "unknown",
  1: "rgbled",
  2: "led",
}

class DeviceManager {
  constructor() {
    this.troopers = {};
    this.deviceMap = {};
    this.devices = [];
    this.deviceCounter = 0;
    this.emitter = new EventEmitter();
  }

  addTrooper(id, trooper, deviceTypes) {
    let existingDevices = (id in this.troopers) ? this.troopers[id].devices : [];
    let match = this._matchDevices(existingDevices, deviceTypes, id);
    trooper.devices = match.devices;
    this.troopers[id] = trooper;
    console.log("Trooper discovered at " + id);
    if (match.changed) {
      this.emitter.emit("trooperDevicesChanged", this.troopers);
    }
  }

  onTrooperDevicesChanged(fn) {
    this.emitter.on("trooperDevicesChanged", fn);
  }

  getDeviceInfo(deviceId) {
    if (deviceId in this.deviceMap) {
      return this.deviceMap[deviceId];
    }
    throw "Unknown Device ID: " + deviceId;
  }

  getTrooper(trooperId) {
    if (trooperId in this.troopers) {
      return this.troopers[trooperId];
    }
    throw "Unknown Trooper ID: " + trooperId;
  }

  _matchDevices(devices, incomingInts, id) {
    let incoming = incomingInts.map(function(typeInt) {
      if (typeInt in deviceTypeMap) {
        return deviceTypeMap[typeInt];
      }
      return deviceTypeMap[0];
    });

    var match = 0;
    var changed = false;
    // Find all the matching devices
    for (var match = 0; match < Math.min(incoming.length, devices.length); match++) {
      if (devices[match].type !== incoming[match]) {
        break;
      }
    }

    let remaining = devices.slice(0, match);
    let removedIds = devices.slice(match).map((device) => {
      return device.id;
    });
    let added = incoming.slice(match).map((type, index) => {
      return new DeviceInfo(this.deviceCounter++, type, id, index);
    });

    // Update the devices array
    this.devices = this.devices.filter(function(device) {
      return !removedIds.includes(device.id);
    });
    this.devices = this.devices.concat(added.map((device) => {
      return {
        id: device.id,
        type: device.type,
        name: device.name,
      };
    }));
    
    // Update the device map
    for (let removedId of removedIds) {
      changed = true;
      delete this.deviceMap[removedId];
    }

    for (let addedDevice of added) {
      changed = true;
      this.deviceMap[addedDevice.id] = addedDevice;
    }

    return {
      devices: remaining.concat(added),
      changed: changed,
    }
  }

}

module.exports = DeviceManager;
