let express = require('express');
let validator = require('express-validator');
let bodyParser = require('body-parser');
let Discovery = require('./discovery');

let start = function(commander, port) {
  let app = express();
  let discovery = new Discovery();

  _setupServer();
  _setupRoutes();
  _listen(port);

  function _setupServer() {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(validator());
  }

  function _setupRoutes() {
    app.get('/', (req, res) => {
      res.status(200).send('Hello World');
    });

    app.post('/command', (req, res) => {
      console.log(req.body);
      let error = commander.sendCommand(req.body);
      if (error) {
        console.log(error);
        res.status(400).send(error);
      } else {
        res.status(200).send('Command Successful');
      }
    });

    app.post('/rename_device', (req, res) => {
      console.log(req.body);
      let error = commander.renameDevice(req.body);
      if (error) {
        console.log(error);
        res.status(400).send(error);
      } else {
        res.status(200).send('Device Successfully Renamed');
      }
    });

    app.get('/device_list', (req, res) => {
      console.log(commander.getDevices());
      res.status(200).send(JSON.stringify(commander.getDevices()));
    });
  }

  function _listen(port) {
    let server = app.listen(port, () => {
      console.log('Listening on port %s...', server.address().port);
      discovery.start(port);
    });
  }
}

module.exports = {
  start: start,
}
