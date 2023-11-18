const fs = require("fs");
const Member = require("../models/member");
const Bill = require("../models/bill");
const utils = require("../helpers");
const { updateMemberBalance } = require("./bill");

/*
  * Admin app views
*/
exports.membersPage = async (_, res) => {
  const members = await Member.find().sort({'details.active': -1, 'details.name': 1});

  res.render("members", { title: "Liikmed", members });
};

exports.addMember = (_, res) => {
  res.render("addMember", { title: "Lisa liige" });
};

exports.editMember = async (req, res) => {
  const member = await Member.findById(req.query.id).populate("bills");

  res.render("editMember", { title: "Muuda liikme andmeid", member });
};

exports.updateMember = async (req, res) => {
  const { name, phone, email, student, active, balance, birthday } = req.body;
  const idCode = req.body["id-code"];

  const details = {
    name,
    phone,
    email,
    student: !!student,
    idCode,
    active: !!active,
  };

  if (birthday) {
    const [day, month] = birthday.split('.');
    details.birthday = new Date("2000", parseInt(month, 10) - 1, parseInt(day, 10));
  }

  const member = await Member.findById(req.query.id);

  member.details = details;
  member.balance = parseFloat(balance) || 0;
  await member.save();

  res.redirect("/members");
}

exports.createMember = async (req, res) => {
  const { name, phone, email, student, birthday } = req.body;
  const details = {
    name,
    phone,
    email,
    student: !!student,
    idCode: req.body["id-code"],
  };

  if (birthday) {
    const [day, month] = birthday.split('.');
    details.birthday = new Date("2000", parseInt(month, 10) - 1, parseInt(day, 10));
  }

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

exports.paymentPage = async (req, res) => {
  const member = await Member.findById(req.query.id).populate("bills");

  res.render("addPayment", { title: "Lisa sissemakse", member });
};                   

exports.addPayment = async (req, res) => {
  const { bills: selectedBills, amount, info, member, date } = req.body;
  const billIds = Array.isArray(selectedBills) ? selectedBills : selectedBills ? [selectedBills] : [];
  const bills = billIds.map(id => ({ sum: 0, id }));
  const sum = utils.decimal(amount);
  const data = {
    bills,
    sum,
    info,
    date,
  };
  const memberData = await Member.findById(member);

  let balance = sum;
  const billsData = await Promise.all(billIds.map(id => Bill.findById(id)));

  for (const billData of billsData) {
    const billSum = utils.getTotalSum(billData);
    const { paid } = billData;
    const billInPaymentData = bills.find(bill => bill.id === billData._id.toString());

    if (paid < billSum) {
      const amountToPay = utils.decimal(billSum - paid);

      if (amountToPay <= balance) {
        billData.paid = utils.decimal(billData.paid + amountToPay);
        billInPaymentData.sum = amountToPay;

        balance = utils.decimal(balance - amountToPay);
      } else if (balance > 0) {
        const paidSum = utils.decimal(balance);
        billData.paid = utils.decimal(billData.paid + paidSum);
        billInPaymentData.sum = paidSum;

        balance = 0;
      }
    }

    await billData.save();
  };

  const payments = [...memberData.payments, data];
  memberData.payments = payments;

  await memberData.save();

  await updateMemberBalance(member, sum, utils.ADD);

  res.redirect("/members");
};

exports.editPayment = async (req, res) => {
  const member = await Member.findById(req.query.memberId).populate("bills");
  const data = member.payments.find(payment => payment._id.toString() === req.query.paymentId);

  res.render("editPayment", { title: "Muuda makse andmeid", member, data });
};

exports.updatePayment = async (req, res) => {
  console.log(req.body)

  res.send({ data: "ok" })
};

/* 
  * API endpoint methods
*/
exports.getMembers = async (_, res) => {
  const members = await Member.find().sort("balance");
  const data = members.map(member => {
    return {
      name: member.details.name,
      balance: utils.displayFormat(member.balance),
      id: member._id,
    };
  });

  res.send({ data });
}

exports.getMemberDetails = async (req, res) => {
  const member = await Member.findById(req.query.id).populate("bills");

  if (!member) {
    res.status(404).send({ message: "Member not found." });
  }

  const data = {
    name: member.details.name,
    bills: member.bills.map(bill => {
      return {
        description: bill.description,
        amount: utils.displayFormat(utils.getTotalSum(bill)),
        paid: utils.displayFormat(bill.paid),
        dateTime: bill.date,
        date: bill.date.toLocaleDateString("et-EE"),
      };
    }).sort((a, b) => {
      if (a.paid > 0 && b.paid > 0) {
        return new Date(a.dateTime) - new Date(b.dateTime);
      }

      return a.paid - b.paid;
    }),
    payments: member.payments.map(item => {
      return {
        description: item.info,
        amount: utils.displayFormat(item.sum),
        dateTime: item.date,
        date: item.date.toLocaleDateString("et-EE"),
        bills: item.bills.map(bill => {
          return {
            description: member.bills.find(billData => billData._id.toString() === bill.id.toString())?.description,
            amount: utils.displayFormat(bill.sum),
          };
        }),
      };
    }).sort((a, b) => {
      return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
    }),
    balance: utils.displayFormat(member.balance),
  };

  res.send({ data });
}

exports.getTotalBalance = async (_, res) => {
  const members = await Member.find();
  const sum = members.reduce((sum, member) => {
    return sum + member.balance;
  }, 0);
  const data = utils.displayFormat(sum);

  res.send({ data });
}

exports.getBirthdays = async (_, res) => {
  const members = await Member.find();
  const data = members.map(member => {
    return {
      name: member.details.name,
      birthday: member.details.birthday?.toLocaleDateString("et-EE", { day: "2-digit", month: "2-digit" }) ?? "",
      active: member.details.active,
    };
  });

  res.send({ data });
}
