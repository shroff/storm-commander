require('console-stamp')(console, { pattern : 'yyyy-mm-dd HH:MM:ss.l' });
let config = require("./config");
let path = require("path");
let StormCommander = require('./local_modules/storm-commander');
let server = require('./local_modules/server');

let devicesJsonPath = path.join(__dirname, config.devicesJson);
let commander = new StormCommander(config.xbeeSerial, devicesJsonPath);
server.start(commander, config.httpPort);
