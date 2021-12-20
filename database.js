require('dotenv').config();
const mongoose = require("mongoose");

const clusterName = process.env.DB_CLUSTER || "test-base";
const hostname = process.env.DB_HOST || "localhost";
const connection = `mongodb://${hostname}:27017/${clusterName}`;
console.log('Connecting to ', connection)

const connectDb = () => mongoose.connect(connection);

require("./models/bill")
require("./models/member")

module.exports = connectDb;
