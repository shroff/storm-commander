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

app.post("/command", function(req, res) {
  console.log(req.body);
  let error = stormCommander.sendCommand(req.body);
  if (error) {
    console.log(error);
    res.status(400).send(error);
  } else {
    res.status(200).send("Command Successful");
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
