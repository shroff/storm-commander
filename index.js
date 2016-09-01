require('console-stamp')(console, { pattern : 'yyyy-mm-dd HH:MM:ss.l' });
let Stormy = require('./local_modules/stormy');

const COMMANDER_PORT = 3000;
const SERIAL_PORT = '/dev/ttyUSB0';

new Stormy(SERIAL_PORT, COMMANDER_PORT).start();
