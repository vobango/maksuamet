const Bill = require("../models/bill");
const Member = require("../models/member");
const utils = require("../helpers");

/*
 * Admin app views
 */
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
  sum = parseFloat(sum) || 0;
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

exports.editBill = async (req, res) => {
  const bill = await Bill.findById(req.query.id).populate('recipient');
  res.render("editBill", { title: `Muuda arvet nr ${bill.billNumber}`, bill });
};

exports.updateBill = async (req, res) => {
  const bill = await Bill.findById(req.query.id);
  const { addVat, date, handoverDate, amount, description } = req.body;
  const sum = parseFloat(req.body.sum) || 0;
  const vatSum = addVat ? sum * utils.VAT : 0;
  const discount = parseInt(req.body.discount, 10) || 0;
  const paid = parseFloat(req.body.paid) || 0;
  const newData = {
    vatSum,
    sum,
    discount,
    date,
    handoverDate,
    amount: parseInt(amount, 10) || 1,
    description,
    paid,
  };

  const memberBalanceShouldBeUpdated = sum !== bill.sum
    || vatSum !== bill.vatSum
    || discount !== bill.discount;
  if (memberBalanceShouldBeUpdated) {
    // Refund old total sum and subtract new total
    updateMemberBalance(bill.recipient, utils.getTotalSum(bill), utils.ADD);
    updateMemberBalance(bill.recipient, utils.getTotalSum(newData), utils.SUBTRACT);
  }

  if (paid !== bill.paid) {
    const diff = paid - bill.paid;
    const transaction = diff > 0 ? utils.ADD : utils.SUBTRACT;

    updateMemberBalance(bill.recipient, diff, transaction);
  }

  Object.assign(bill, newData);
  bill.save();

  res.redirect("/bills");
}

exports.deleteBill = async (req, res) => {
  const bill = await Bill.findById(req.query.id);
  await updateMemberBalance(bill.recipient, utils.getTotalSum(bill), utils.ADD);
  await Member.findByIdAndUpdate(bill.recipient, { $pull: { bills: bill._id } });
  await Bill.findByIdAndDelete(req.query.id);

  res.redirect("/bills");
}

/*
 * API endpoints
 */
exports.getEvents = async (_, res) => {
  const events = await Bill.distinct("description");

  res.send({ data: events });
}

exports.getEventData = async (req, res) => {
  const bills = await Bill.find({ description: req.query.id }).populate({ path: "recipient", select: "details.name" });
  const data = {
    sum: bills.reduce((sum, bill) => {
      return sum + utils.getTotalSum(bill);
    }, 0).toFixed(2),
    paid: bills.reduce((sum, bill) => {
      return sum + bill.paid;
    }, 0).toFixed(2),
    bills: bills.map(bill => {
      return {
        amount: utils.getTotalSum(bill),
        member: bill.recipient.details.name,
        paid: bill.paid,
      };
    }),
  };

  res.send({ data });
}

/*
 * Utilities
 */
const saveBillToMember = async (details) => {
  const bill = await new Bill(details).save();
  let sum = utils.getTotalSum(details);

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

exports.handleCSVUpload = (req, res) => {
  console.log(req)
  res.send(req.body)
}
