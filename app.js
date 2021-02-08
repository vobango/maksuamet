const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const routes = require("./routes");

const app = express();

// Set up views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Set up public directory
app.use(express.static(path.join(__dirname, "public")));

// Set up body-parser for accessing POST request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up routes
app.use("/", routes);

module.exports = app;
