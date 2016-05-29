var express = require("express");
var bodyParser = require("body-parser");
var stormTrooper = require("./local_modules/storm-trooper");
var app = express();
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 
app.get("/", function(req, res) {
  res.status(200).send("Hello World");
});

app.post("/lightemup", function(req, res) {
  if (!req.body || !req.body.color) {
    return res.status(400).send("Must specify color\n");
  }
  let color = parseInt(req.body.color, 16);
  let r = (color & 0xff0000) >> 16;
  let g = (color & 0xff00) >> 8;
  let b = (color & 0xff);

  stormTrooper.setColor(r >> 1, g >> 1, b >> 1);

  res.status(200);
  res.send("Setting color to: " + r + ", " + g + ", " + b + ".\n");
});

var server = app.listen(3000, function () {
  console.log("Listening on port %s...", server.address().port);
});
