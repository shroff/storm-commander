deviceMap = {
  0: "unknown",
  1: "rgbled",
  2: "led",
}

class StormTrooper {
  constructor(addr64, addr16, devices) {
    this.addr64 = addr64;
    this.addr16 = addr16;
    this.devices = devices.map(function(deviceType) {
      if (deviceType in deviceMap) {
        return deviceMap[deviceType];
      }
      return deviceMap[0];
    });
    this.stale = false;
  }

  markStale() {
    this.stale = true;
  }
}

module.exports = StormTrooper
