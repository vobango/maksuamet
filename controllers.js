const Member = require("./models/member");

exports.homePage = (_, res) => {
  res.render("index", { title: "Koduleht" });
};

exports.membersPage = async (_, res) => {
  const members = await Member.find();

  res.render("members", { title: "Liikmed", members });
};

exports.addMember = async (_, res) => {
  res.render("addMember", { title: "Lisa uus liige" });
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
