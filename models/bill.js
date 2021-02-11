const mongoose = require("mongoose");
const utils = require("../helpers")
const AutoIncrement = require("mongoose-sequence")(mongoose)

const billSchema = new mongoose.Schema({
  date: {
    default: Date.now,
    type: Date
  },
  handoverDate: {
    default: Date.now,
    type: Date
  },
  sum: {
    type: Number,
    required: "Summa on kohustuslik"
  },
  description: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    default: 1
  },
  file: String,
  members: [{ type: mongoose.Schema.ObjectId, ref: "Member" }],
  vatSum: Number
});

billSchema.plugin(AutoIncrement, {inc_field: "billNumber"});

const Bill = mongoose.model("Bill", billSchema);

module.exports = Bill;
