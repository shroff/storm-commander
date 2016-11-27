let express = require('express')

let api = function(commander) {
  let router = express.Router();

  router.post('/command', (req, res) => {
    console.log(req.body);
    let error = commander.sendCommand(req.body);
    if (error) {
      console.log(error);
      res.status(400).send(error);
    } else {
      res.status(200).send('Command Successful');
    }
  });

  router.post('/rename_device', (req, res) => {
    console.log(req.body);
    let error = commander.renameDevice(req.body);
    if (error) {
      console.log(error);
      res.status(400).send(error);
    } else {
      res.status(200).send('Device Successfully Renamed');
    }
  });

  router.get('/device_list', (req, res) => {
    console.log(commander.getDevices());
    res.status(200).send(JSON.stringify(commander.getDevices()));
  });

  return router;
}

module.exports = api;
