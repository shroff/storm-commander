let Device = require("./devices/device");
let DimmableDevice = require("./devices/dimmable-device");

let deviceTypeMap = {
  0: 'unknown',
  1: 'rgbled',
  2: DimmableDevice.type(),
}

let createDevice = function(index, deviceType) {
  switch (deviceType) {
    case DimmableDevice.type():
      return new DimmableDevice(index);

    default:
      return new Device(index, deviceType, {});
  }
}

let match = function(devices, incomingTypes) {
  let incoming = Array.from(incomingTypes, (typeInt) => {
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
  let removed = devices.slice(match);
  let added = incoming.slice(match).map((type, index) => {
    return createDevice(index, type);
  });

  return {
    remaining: remaining,
    removed: removed,
    added: added,
  }
}

module.exports = {
  match: match,
  createDevice: createDevice
}
