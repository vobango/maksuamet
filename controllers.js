const Member = require("./models/member");
const Bill = require("./models/bill");

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
  const details = {
    description,
    date,
    sum: parseFloat(sum),
    members: req.body["member-list"]
  };

  const bill = await new Bill(details).save();
  // TODO: update balance
  await Member.updateMany({ _id: { $in: details.members } }, { $addToSet: { bills: bill._id } });

  res.redirect("/members");
};
