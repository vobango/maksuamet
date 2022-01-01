const Member = require("../models/member");

exports.membersPage = async (_, res) => {
  const members = await Member.find();

  res.render("members", { title: "Liikmed", members });
};

exports.addMember = (_, res) => {
  res.render("addMember", { title: "Lisa liige" });
};

exports.editMember = async (req, res) => {
  const member = await Member.findById(req.query.id);

  res.render("editMember", { title: "Muuda liikme andmeid", member });
};

exports.updateMember = async (req, res) => {
  const { name, phone, email, student, active, balance } = req.body;
  const idCode = req.body["id-code"];
  const details = {
    name,
    phone,
    email,
    student: !!student,
    idCode,
    active: !!active,
  };
  const member = await Member.findById(req.query.id);

  member.details = details;
  member.balance = parseFloat(balance) || 0;
  await member.save();

  res.redirect("/members");
}

exports.createMember = async (req, res) => {
  const { name, phone, email, student } = req.body;
  const details = {
    name,
    phone,
    email,
    student,
    idCode: req.body["id-code"]
  };
  await new Member({ details }).save();

  res.redirect("/members");
};
