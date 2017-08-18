let util = require('util')

let commandParams = {
  'c': [
    {
      'name': 'color',
      'type': 'color',
    },
    {
      'name': 'duration',
      'type': 'int',
      'default': 1000,
    },
  ],
  'p': [
    {
      'name': 'color1',
      'type': 'color',
    },
    {
      'name': 'color2',
      'type': 'color',
    },
    {
      'name': 'duration',
      'type': 'int',
      'default': 1000,
    },
  ],
  'b': [
    {
      'name': 'value',
      'type': 'byte',
    },
    {
      'name': 'duration',
      'type': 'int',
      'default': 1000,
    },
  ],
}

generateCommandString = function(command, params) {
  if (!command in commandParams) {
    throw 'Parameters not known for command ' + command;
  }

  var paramString = '';
  for (let param of commandParams[command]) {
    paramString += ' ';
    let value = (param.name in params) ? params[param.name] : param['default'];
    if (value == undefined) {
      throw 'No value found for required param ' + param.name + ' in ' + util.inspect(params);
    }
    switch (param.type) {
      case 'byte':
        let byteVal = value & 0xff;
        paramString += byteVal
        break;

      case 'color':
        let color = parseInt(value, 16);
        // TODO: Make trooper accept 8-bit values instead of 7-bit
        let r = (color & 0xff0000) >> 16;
        let g = (color & 0xff00) >> 8;
        let b = (color & 0xff);
        paramString += r + ' ' + g + ' ' + b;
        break;

      case 'int':
      default:
        paramString += value;
        break;
    }
  }

  return command + paramString;
}

module.exports = {
  generateCommandString: generateCommandString
}
