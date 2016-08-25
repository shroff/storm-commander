var express = require("express");
var validator = require("express-validator");
var bodyParser = require("body-parser");
var stormCommander = require("./local_modules/storm-commander");
var discovery = require("./local_modules/discovery");
var app = express();

const COMMANDER_PORT = 3000;
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(validator());
 
app.get("/", function(req, res) {
  res.status(200).send("Hello World");
});

app.post("/lightemup", function(req, res) {
  console.log(req.body);
  req.checkBody("color", "Must specify color").notEmpty();
  req.checkBody("trooper", "Must specify trooper").notEmpty();
  req.checkBody("device", "Must specify device").notEmpty();

  let validationErrors = req.validationErrors();
  if (validationErrors) {
    res.status(400).send(validationErrors);
    return;
  }

  let trooper = req.body.trooper;
  let device = parseInt(req.body.device);

  let color = parseInt(req.body.color, 16);
  let duration = req.body.duration ? parseInt(req.body.duration) : 1000;
  let r = (color & 0xff0000) >> 16;
  let g = (color & 0xff00) >> 8;
  let b = (color & 0xff);

  let error = stormCommander.setColor(trooper, device, r >> 1, g >> 1, b >> 1, duration);
  if (error) {
    console.log(error);
    res.status(400).send(error);
  } else {
    res.status(200);
    res.send("Setting color to: " + r + ", " + g + ", " + b + ".\n");
  }
});

app.post("/pulse", function(req, res) {

  console.log(req.body);
  req.checkBody("color1", "Must specify color1").notEmpty();
  req.checkBody("color2", "Must specify color2").notEmpty();
  req.checkBody("trooper", "Must specify trooper").notEmpty();
  req.checkBody("device", "Must specify device").notEmpty();

  let validationErrors = req.validationErrors();
  if (validationErrors) {
    res.status(400).send(validationErrors);
    return;
  }

  let trooper = req.body.trooper;
  let device = parseInt(req.body.device);

  let color1 = parseInt(req.body.color1, 16);
  let r1 = (color1 & 0xff0000) >> 16;
  let g1 = (color1 & 0xff00) >> 8;
  let b1 = (color1 & 0xff);

  let color2 = parseInt(req.body.color2, 16);
  let r2 = (color2 & 0xff0000) >> 16;
  let g2 = (color2 & 0xff00) >> 8;
  let b2 = (color2 & 0xff);

  let duration = req.body.duration ? parseInt(req.body.duration) : 1000;

  let error = stormCommander.pulse(trooper, device, r1 >> 1, g1 >> 1, b1 >> 1, r2 >> 1, g2 >> 1, b2 >> 1, duration);
  if (error) {
    console.log(error);
    res.status(400).send(error);
  } else {
    res.status(200);
    let color1String = r1 + ", " + g1 + ", " + b1;
    let color2String = r2 + ", " + g2 + ", " + b2;
    res.send("Pulsing between " + color1String + " and " + color2String + " every " + duration + "ms");
  }

});

app.get("/ping", function(req, res) {
  console.log(stormCommander.getTrooperDescriptions());
  res.status(200).send(stormCommander.getTrooperDescriptions());
});

discovery.start(COMMANDER_PORT);

var server = app.listen(COMMANDER_PORT, function () {
  console.log("Listening on port %s...", server.address().port);
});
