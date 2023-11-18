const fs = require("fs");
const Member = require("../models/member");
const Bill = require("../models/bill");
const utils = require("../helpers");
const { calculateMemberBalance } = require("../helpers/balance");

/*
  * Admin app views
*/
exports.membersPage = async (_, res) => {
  const members = await Member.find().sort({'details.active': -1, 'details.name': 1}).populate('bills');
  const displayData = members.map(member => {
    const balanceRaw = calculateMemberBalance(member);
    const birthdayRaw = member.details.birthday;

    return {
      ...member.details,
      id: member._id,
      balance: utils.displayFormat(balanceRaw),
      balanceRaw,
      birthday: birthdayRaw ? birthdayRaw.toLocaleDateString("et-EE", utils.dateFormatOptions) : "",
      birthdayRaw,
    };
  });

  res.render("members", { title: "Liikmed", members: displayData, calculateMemberBalance });
};

exports.addMember = (_, res) => {
  res.render("addMember", { title: "Lisa liige" });
};

exports.editMember = async (req, res) => {
  const member = await Member.findById(req.query.id).populate("bills");
  const balanceRaw = calculateMemberBalance(member);
  const birthdayRaw = member.details.birthday;
  const idCode = member.details.idCode;
  const bDayFromIdCode = idCode && idCode.length > 7 ? idCode.substring(5, 7) + "." + idCode.substring(3, 5) : "";
  const birthday = birthdayRaw ? birthdayRaw.toLocaleDateString("et-EE", utils.dateFormatOptions) : bDayFromIdCode;
  const displayData = {
    ...member.details,
    id: member._id,
    balance: utils.displayFormat(balanceRaw),
    birthday,
    birthdayRaw,
    bills: member.bills.sort((a, b) => {
      if (a.paid > 0 && b.paid > 0) {
        return new Date(b.date) - new Date(a.date);
      }

      return a.paid - b.paid;
    }),
    billTotal: utils.displayFormat(member.bills.reduce((acc, bill) => acc + utils.getTotalSum(bill), 0)),
    payments: member.payments,
    paymentTotal: utils.displayFormat(member.payments.reduce((acc, payment) => acc + payment.sum, 0)),
  };

  res.render("editMember", { title: "Muuda liikme andmeid", member: displayData });
};

exports.updateMember = async (req, res) => {
  const { name, phone, email, student, active, birthday } = req.body;
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
  const members = await Member.find().populate("bills");
  const data = members.map(member => {
    const balanceRaw = calculateMemberBalance(member);
    return {
      name: member.details.name,
      balanceRaw,
      balance: utils.displayFormat(balanceRaw),
      id: member._id,
    };
  });

  data.sort((a, b) => {
    return a.balanceRaw - b.balanceRaw;
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
    balance: utils.displayFormat(calculateMemberBalance(member)),
  };

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

exports.fixPrepaidBalances = async (_, res) => {
  const members = await Member.find().populate("bills");

  for (const member of members) {
    const allBillsInPayments = member.payments.flatMap(payment => payment.bills).map(bill => bill.id);
    const prePaidBills = member.bills.filter(bill => {
      return bill.paid > 0 && allBillsInPayments.indexOf(bill._id.toString()) === -1;
    });
    let newPayment = null;

    if (prePaidBills.length > 0) {
      const prePaidSum = prePaidBills.reduce((acc, bill) => acc + utils.decimal(bill.paid), 0);
      newPayment = {
        bills: prePaidBills.map(bill => ({ sum: bill.paid, id: bill._id })),
        sum: prePaidSum,
        info: "Tasaarveldus vanade arvetega",
        date: new Date(),
      };
      const payments = [...member.payments, newPayment];
      member.payments = payments;

      await member.save();
    }
  }

  res.send({ data: 'ok' })
}
