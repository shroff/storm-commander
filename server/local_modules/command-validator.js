let deviceCommands = {
  'rgbled': ['c', 'p'],
  'dimmable': ['b'],
}

let validate = function(device, command) {
  if (!(device.type in deviceCommands)) {
    throw 'Unknown device type(' + device.type + ') for device ' + device.index;
  }
  if (!deviceCommands[device.type].includes(command.name)) {
    throw 'Unknown command ' + command.name + ' for device of type ' + device.type;
  }
}

module.exports = {
  validate: validate,
}
