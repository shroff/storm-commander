require('console-stamp')(console, { pattern : 'yyyy-mm-dd HH:MM:ss.l' });
let path = require("path");

let config = require("./config");
let StormCommander = require('./local_modules/storm-commander');
let Discovery = require('./local_modules/discovery');

let devicesJsonPath = path.join(__dirname, config.devicesJson);

let commander = new StormCommander(config.xbeeSerial, devicesJsonPath);
let discovery = new Discovery();
let app = require("./app.js")(commander);
let server = app.listen(config.httpPort, () => {
  console.log('Listening on port %s...', server.address().port);
  discovery.start(server.address().port);
});
