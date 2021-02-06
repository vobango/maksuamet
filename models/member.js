const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "MEMBER"
  },
  payments: [{ date: Date, sum: Number, info: String }],
  bills: [{type: mongoose.Schema.ObjectId, ref: "Bill"}],
  balance: {
    type: Number,
    default: 0
  },
  details: {
    name: String,
    active: Boolean
  }
});

const Member = mongoose.model("Member", memberSchema);

module.exports = Member;
