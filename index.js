var express = require("express");
var bodyParser = require("body-parser");
var stormCommander = require("./local_modules/storm-commander");
var discovery = require("./local_modules/discovery");
var app = express();

const COMMANDER_PORT = 3000;
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 
app.get("/", function(req, res) {
  res.status(200).send("Hello World");
});

app.get("/ping", function(req, res) {
  res.status(200).send("pong");
});

app.post("/lightemup", function(req, res) {
  if (!req.body || !req.body.color || !req.body.duration) {
    return res.status(400).send("Must specify color and duration\n");
  }
  let color = parseInt(req.body.color, 16);
  let duration = parseInt(req.body.duration);
  let r = (color & 0xff0000) >> 16;
  let g = (color & 0xff00) >> 8;
  let b = (color & 0xff);

  stormCommander.setColor(r >> 1, g >> 1, b >> 1, duration);

  res.status(200);
  res.send("Setting color to: " + r + ", " + g + ", " + b + ".\n");
});

app.post("/pulse", function(req, res) {
  if (!req.body || !req.body.color1 || !req.body.color2 || !req.body.duration) {
    return res.status(400).send("Must specify color\n");
  }
  let color1 = parseInt(req.body.color1, 16);
  let r1 = (color1 & 0xff0000) >> 16;
  let g1 = (color1 & 0xff00) >> 8;
  let b1 = (color1 & 0xff);

  let color2 = parseInt(req.body.color2, 16);
  let r2 = (color2 & 0xff0000) >> 16;
  let g2 = (color2 & 0xff00) >> 8;
  let b2 = (color2 & 0xff);

  let duration = parseInt(req.body.duration);

  stormCommander.pulse(r1 >> 1, g1 >> 1, b1 >> 1, r2 >> 1, g2 >> 1, b2 >> 1, duration);

  res.status(200);
  let color1String = r1 + ", " + g1 + ", " + b1;
  let color2String = r2 + ", " + g2 + ", " + b2;
  res.send("Pulsing between " + color1String + " and " + color2String + " every " + duration + "ms");
});

app.get("/devices", function(req, res) {
  var deviceList = [
    {
      name: "test",
      type: "rgbled",
    },
  ];
  res.status(200);
  res.send(JSON.stringify(deviceList));
});

discovery.start(COMMANDER_PORT);

var server = app.listen(COMMANDER_PORT, function () {
  console.log("Listening on port %s...", server.address().port);
});
