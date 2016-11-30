var webpack = require("webpack");
var path = require("path");
 
var CLIENT = path.resolve(__dirname, "client/src/js");
var OUTPUT = path.resolve(__dirname, "client/static");
 
var config = {
  entry: CLIENT + "/app.jsx",
  output: {
    path: OUTPUT,
    filename: "bundle.js"
  },
  module: {
    loaders: [{
        include: CLIENT,
        loader: "babel",
    }]
  }
};
 
module.exports = config;
