const multer = require("multer");
const uuid = require("uuid");
const Member = require("./models/member");
const Bill = require("./models/bill");
const utils = require("./helpers");

exports.homePage = (_, res) => {
  res.render("index", { title: "Koduleht" });
};

exports.test = (_, res) => {
  res.send({ message: `Hello, world` });
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
  const bills = await Bill.find().populate('recipient');

  res.render("bills", { title: "Arved", bills });
};

exports.addBill = async (_, res) => {
  const members = await Member.find();

  res.render("addBill", { title: "Lisa arve", members });
};

exports.createBill = async (req, res) => {
  let { sum, date, description, file, handoverDate, amount, recipients, addVat, discount } = req.body;
  sum = parseFloat(sum);
  discount = parseInt(discount, 10) || 0;
  recipients = Array.isArray(recipients) ? recipients : [recipients];

  const vatSum = addVat ? sum * utils.VAT : 0;
  const details = {
    description,
    date,
    discount,
    handoverDate,
    amount,
    sum,
    vatSum,
    file
  };

  for (let recipient of recipients) {
    await saveBillToMember({...details, recipient})
  }

  res.redirect("/bills");
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

const saveBillToMember = async (details) => {
  const bill = await new Bill(details).save()
  const sum = details.sum + details.vatSum;

  await Member.findByIdAndUpdate(details.recipient, { $addToSet: { bills: bill._id } })
  await updateMemberBalance(details.recipient, sum, utils.SUBTRACT)
}

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
