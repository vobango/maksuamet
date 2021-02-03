const mongoose = require("mongoose");
const User = require("./models/user");

const clusterName = "test-base";
const connection = `mongodb://localhost:27017/${clusterName}`;

const connectDb = () => mongoose.connect(connection);

module.exports = connectDb;
