const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "MEMBER"
  },
  payments: [{ date: Date, sum: Number, info: String }],
  bills: [{ date: Date, sum: Number, info: String }],
  balance: {
    type: Number,
    default: 0
  },
  details: {
    name: String,
    active: Boolean
  }
});

const Member = mongoose.model("User", memberSchema);

module.exports = Member;
