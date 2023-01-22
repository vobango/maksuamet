const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const routes = require("./routes");
const utils = require("./helpers");
const cors = require('cors');

const app = express();

// Set up views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Set up cors
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
}));

// Set up public directory
app.use(express.static(path.join(__dirname, "public")));

// Set up body-parser for accessing POST request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Make utilities available in templates/controllers
app.use((req, res, next) => {
  res.locals.utils = utils;
  res.locals.currentPath = req.path

  next();
});

// Set up routes
app.use("/", routes);

app.use(utils.errorHandler);

module.exports = app;
