const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  date: {
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
  file: String,
  members: [{ type: mongoose.Schema.ObjectId, ref: "Member" }]
});

const Bill = mongoose.model("Bill", billSchema);

module.exports = Bill;
