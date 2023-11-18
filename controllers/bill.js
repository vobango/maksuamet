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
    await updateMemberBalance(bill.recipient, utils.getTotalSum(bill), utils.ADD);
    await updateMemberBalance(bill.recipient, utils.getTotalSum(newData), utils.SUBTRACT);
  }

  if (paid !== bill.paid) {
    const diff = paid - bill.paid;
    const transaction = diff > 0 ? utils.ADD : utils.SUBTRACT;

    await updateMemberBalance(bill.recipient, diff, transaction);
  }

  Object.assign(bill, newData);
  await bill.save();

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
  const uniqueEvents = await Bill.distinct("description");
  const events = await Promise.all(uniqueEvents.map(event => Bill.findOne({ description: event }, 'description date')));

  res.send({ data: events.map(event => ({ name: event.description, date: new Date(event.date).getTime() })) });
}

exports.getEventData = async (req, res) => {
  const bills = await Bill.find({ description: req.query.id }).populate({ path: "recipient", select: "details.name" });
  const sum = bills.reduce((sum, bill) => {
      return sum + utils.getTotalSum(bill);
    }, 0);
  const paid = bills.reduce((sum, bill) => {
      return sum + bill.paid;
    }, 0);
  const data = {
    name: req.query.id,
    date: new Date(bills[0].date).getTime(),
    sum: utils.displayFormat(sum),
    paid: utils.displayFormat(paid),
    bills: bills.map(bill => {
      return {
        amount: utils.displayFormat(utils.getTotalSum(bill)),
        member: bill.recipient?.details.name,
        paid: utils.displayFormat(bill.paid),
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
  const value = utils.decimal(amount);
  let balance = 0;

  if (transaction === utils.ADD) {
    balance = utils.decimal(member.balance) + value;
  }
  if (transaction === utils.SUBTRACT) {
    balance = utils.decimal(member.balance) - value;
  }

  member.balance = utils.decimal(balance);

  await member.save();
};

exports.updateMemberBalance = updateMemberBalance;

exports.handleCSVUpload = (req, res) => {
  console.log(req)
  res.send(req.body)
}
