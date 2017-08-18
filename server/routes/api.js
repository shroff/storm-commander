let express = require('express')

let api = function(commander) {
  let router = express.Router();

  router.post('/command', (req, res) => {
    console.log(req.body);

    let deviceId = _getDeviceId(req.body)

    try {
      commander.sendCommand(deviceId, req.body.command, req.body.debug);
      res.status(200).send('Command Successful');
    } catch (err) {
      console.log(err);
      console.log("Sending 400");
      res.status(400).send(err);
    }
  });

  router.post('/rename_device', (req, res) => {
    console.log(req.body);

    let deviceId = _getDeviceId(req.body)
    let name = req.body.name

    try {
      commander.renameDevice(deviceId, name);
      res.status(200).send('Device Successfully Renamed');
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  });

  router.get('/device_list', (req, res) => {
    console.log(commander.getDevices());
    res.status(200).send(JSON.stringify(commander.getDevices()));
  });

  return router;
}

let _getDeviceId = function(args) {
  if (!("device" in args)) {
    throw "Missing device identifier";
  }
  return parseInt(args.device);
}

module.exports = api;
