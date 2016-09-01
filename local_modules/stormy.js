let express = require('express');
let validator = require('express-validator');
let bodyParser = require('body-parser');
let StormCommander = require('./storm-commander');
let Discovery = require('./discovery');

class Stormy {
  constructor(serialPort, commanderPort) {
    this.serialPort = serialPort;
    this.commanderPort = commanderPort;
    this.app = express();
    this.discovery = new Discovery();
    this.id = Math.floor(Math.random() * 1e52)
    this.stormCommander = new StormCommander(this.serialPort);
  }

  start() {
    this.setupServer();
    this.setupRoutes();
    this.startServer();
  }

  setupServer() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(validator());
  }

  startServer() {
    this.server = this.app.listen(this.commanderPort, () => {
      console.log('Listening on port %s...', this.server.address().port);
      this.discovery.start(this.commanderPort);
      this.stormCommander.onTrooperDevicesChanged((troopers) => {
        console.log(troopers);
      });
    });
  }

  setupRoutes() {
    this.app.get('/', (req, res) => {
      res.status(200).send('Hello World');
    });

    this.app.post('/command', (req, res) => {
      console.log(req.body);
      let error = this.stormCommander.sendCommand(req.body);
      if (error) {
        console.log(error);
        res.status(400).send(error);
      } else {
        res.status(200).send('Command Successful');
      }
    });

    this.app.get('/device_list', (req, res) => {
      console.log(this.stormCommander.getDevices());
      res.status(200).send(JSON.stringify(this.stormCommander.getDevices()));
    });
  }
}

module.exports = Stormy;
