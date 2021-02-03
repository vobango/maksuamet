const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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

const User = mongoose.model("User", userSchema);

module.exports = User;
