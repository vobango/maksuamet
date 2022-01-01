const fs = require("fs");
const Member = require("../models/member");
const Bill = require("../models/bill");

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


exports.deleteMember = async (req, res) => {
  const member = await Member.findById(req.query.id).populate("bills");
  member.bills.forEach(async bill => {
    if (bill.file) {
      try {
        fs.unlinkSync(`${__dirname}/public/uploads/${filename}`);
      } catch(error) {
        console.log(error);
      }
    }
    await Bill.findByIdAndDelete(bill._id);
  });

  await Member.findByIdAndDelete(req.query.id);
  
  res.redirect("/members");
}
