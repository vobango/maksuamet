const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "MEMBER"
  },
  payments: [{ date: Date, sum: Number, info: String }],
  bills: [{ type: mongoose.Schema.ObjectId, ref: "Bill" }],
  balance: {
    type: Number,
    default: 0
  },
  details: {
    name: {
      type: String,
      required: "Nimi on kohustuslik"
    },
    email: String,
    phone: String,
    idCode: {
      type: String,
      unique: true
    },
    birthday: Date,
    active: {
      type: Boolean,
      default: true
    },
    student: {
      type: Boolean,
      default: false
    }
  }
});

const Member = mongoose.model("Member", memberSchema);

module.exports = Member;
