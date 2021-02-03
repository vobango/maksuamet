const mongoose = require("mongoose");
const User = require("./models/user");

const clusterName = process.env.DB_CLUSTER || "test-base";
const hostname = process.env.DB_HOST || "localhost";
const connection = `mongodb://${hostname}:27017/${clusterName}`;

const connectDb = () => mongoose.connect(connection);

module.exports = connectDb;
