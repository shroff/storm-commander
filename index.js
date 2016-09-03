require('console-stamp')(console, { pattern : 'yyyy-mm-dd HH:MM:ss.l' });
let fs = require('fs');
let util = require('util')
let StormCommander = require('./local_modules/storm-commander');
let server = require('./local_modules/server');

const SAVE_FILE = 'commander.json';
const COMMANDER_PORT = 3000;
const SERIAL_PORT = '/dev/ttyUSB0';

let readData = function(saveFile) {
  try {
    fs.accessSync(saveFile, fs.constants.R_OK | fs.constants.W_OK);
  } catch (err) {
    throw "Could not open config file for read+write:\n" + util.inspect(err)
  }
  return JSON.parse(fs.readFileSync(saveFile))
}

let saveData = function(saveFile) {
  return function(data) {
    fs.writeFile(saveFile, data);
  }
}

let start = function(serialPort, saveFile, port) {
  fs.stat(saveFile, (err, stats) => {
    let data = err ? null : readData(saveFile);
    let commander = new StormCommander(serialPort, saveData(saveFile), data);
    server.start(commander, port);

  });
}

start(SERIAL_PORT, SAVE_FILE, COMMANDER_PORT);

