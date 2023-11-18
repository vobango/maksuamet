const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: String,
});

const Role = mongoose.model("Role", roleSchema);

exports.Role = Role;

// Current role definitions
const roles = ['member', 'manager', 'memberModerator'];

exports.roles = roles;
