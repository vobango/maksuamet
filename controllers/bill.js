const Bill = require("../models/bill");
const Member = require("../models/member");
const utils = require("../helpers");

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

exports.handleCSVUpload = (req, res) => {
  console.log(req)
  res.send(req.body)
}

const saveBillToMember = async (details) => {
  const bill = await new Bill(details).save();
  let sum = details.sum + details.vatSum;

  if (details.discount) {
    sum = sum - (sum * (details.discount / 100));
  }

  await Member.findByIdAndUpdate(details.recipient, { $addToSet: { bills: bill._id } })
  await updateMemberBalance(details.recipient, sum, utils.SUBTRACT)
};

const updateMemberBalance = async (memberId, amount, transaction) => {
  const member = await Member.findById(memberId);
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
