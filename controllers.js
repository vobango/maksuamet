const multer = require("multer");
const uuid = require("uuid");
const Member = require("./models/member");
const Bill = require("./models/bill");
const utils = require("./helpers");

exports.homePage = (_, res) => {
  res.render("index", { title: "Koduleht" });
};

// Members
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

// Bills
exports.billsPage = async (_, res) => {
  const bills = await Bill.find();

  res.render("bills", { title: "Arved", bills });
};

exports.addBill = async (_, res) => {
  const members = await Member.find();

  res.render("addBill", { title: "Lisa arve", members });
};

exports.createBill = async (req, res) => {
  const { sum, date, description, file } = req.body;
  let members = req.body["member-list"];
  members = Array.isArray(members) ? members : [members];
  const details = {
    description,
    date,
    sum: parseFloat(sum),
    members,
    file
  };

  const bill = await new Bill(details).save();
  await Member.updateMany({ _id: { $in: details.members } }, { $addToSet: { bills: bill._id } });

  const balancePromises = members.map((id) => updateMemberBalance(id, sum, utils.SUBTRACT));
  await Promise.all(balancePromises);

  res.redirect("/members");
};

exports.downloadFile = (req, res) => {
  const file = `${__dirname}/public/uploads/${req.params.filename}`;

  res.download(file);
};

// Utilities
const updateMemberBalance = async (id, amount, transaction) => {
  const member = await Member.findById(id);
  let balance = 0;
  if (transaction === utils.ADD) {
    balance = member.balance + amount;
  }
  if (transaction === utils.SUBTRACT) {
    balance = member.balance - amount;
  }

  member.balance = balance;
  member.save();
};

const multerOptions = {
  storage: multer.diskStorage({
    destination: (req, file, next) => {
      next(null, "./public/uploads");
    },
    filename: (req, file, next) => {
      const name = `${uuid.v4()}.${file.mimetype.split("/")[1]}`;
      req.body.file = name;
      next(null, name);
    }
  })
};

exports.upload = multer(multerOptions).single("file");
