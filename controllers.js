const Member = require("./models/member");
const Bill = require("./models/bill");
const utils = require("./helpers")

exports.homePage = (_, res) => {
  res.render("index", { title: "Koduleht" });
};

exports.membersPage = async (_, res) => {
  const members = await Member.find();

  res.render("members", { title: "Liikmed", members });
};

exports.addMember = (_, res) => {
  res.render("addMember", { title: "Lisa liige" });
};

exports.createMember = async (req, res) => {
  const { name, phone, email } = req.body;
  const details = {
    name,
    phone,
    email,
    idCode: req.body["id-code"]
  };
  await new Member({ details }).save();

  res.redirect("/members");
};

exports.addBill = async (_, res) => {
  const members = await Member.find();

  res.render("addBill", { title: "Lisa arve", members });
};

exports.createBill = async (req, res) => {
  const { sum, date, description } = req.body;
  let members = req.body["member-list"]
  members = Array.isArray(members) ? members : [members]
  const details = {
    description,
    date,
    sum: parseFloat(sum),
    members
  };

  const bill = await new Bill(details).save();
  await Member.updateMany({ _id: { $in: details.members } }, { $addToSet: { bills: bill._id } });

  const balancePromises = members.map(id => updateMemberBalance(id, sum, utils.SUBTRACT));
  await Promise.all(balancePromises)

  res.redirect("/members");
};

const updateMemberBalance = async (id, amount, transaction) => {
const member = await Member.findById(id)
  let balance = 0;
  if (transaction === utils.ADD) {
    balance = member.balance + amount;
  }
  if (transaction === utils.SUBTRACT){
    balance = member.balance - amount;
  }

  member.balance = balance;
  member.save()
}
