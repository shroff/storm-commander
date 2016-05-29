var router = function(app) {
  app.get("/", function(req, res) {
      res.status(200).send("Hello World");
  });
}

module.exports = router;
