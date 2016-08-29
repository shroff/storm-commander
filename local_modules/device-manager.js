let DeviceInfo = require("./device-info");
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
  }

  addTrooper(id, newTrooper, deviceTypes) {
    if (!(id in this.troopers)) {
      this.troopers[id] = newTrooper;
      console.log("Discovered trooper at " + id);
    }
    let trooper = this.troopers[id];
    trooper.devices = this._matchDevices(trooper, deviceTypes);
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

  _matchDevices(trooper, incomingInts) {
    let incoming = incomingInts.map(function(typeInt) {
      if (typeInt in deviceTypeMap) {
        return deviceTypeMap[typeInt];
      }
      return deviceTypeMap[0];
    });

    var match = 0;
    // Find all the matching devices
    for (var match = 0; match < Math.min(incoming.length, trooper.devices.length); match++) {
      if (trooper.devices[match].type !== incoming[match]) {
        break;
      }
    }

    let remaining = trooper.devices.slice(0, match);
    let removedIds = trooper.devices.slice(match).map((device) => {
      return device.id;
    });
    let added = incoming.slice(match).map((type, index) => {
      return new DeviceInfo(this.deviceCounter++, type, trooper.id, index);
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
      delete this.deviceMap[removedId];
    }

    for (let addedDevice of added) {
      this.deviceMap[addedDevice.id] = addedDevice;
    }

    return remaining.concat(added);
  }

}

module.exports = DeviceManager;
