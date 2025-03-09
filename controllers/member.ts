import { Request, Response } from 'express';
import fs from 'fs';
import { Document } from 'mongoose';
import MemberModel from '../models/member';
import BillModel from '../models/bill';
import * as utils from '../helpers';
import { calculateMemberBalance } from '../helpers/balance';

interface MemberDisplayData {
  name: string;
  email?: string;
  phone?: string;
  idCode: string;
  birthday?: string;
  birthdayRaw?: Date;
  active: boolean;
  student: boolean;
  id: string;
  balance: string;
  balanceRaw: number;
  bills: Array<{
    description: string;
    amount: string;
    paid: number;
    date: Date;
  }>;
  billTotal: string;
  payments: Array<{
    date: Date;
    sum: number;
    info: string;
    bills: Array<{
      sum: number;
      id: string;
    }>;
  }>;
  paymentTotal: string;
}

interface MemberDetails {
  name: string;
  phone?: string;
  email?: string;
  student: boolean;
  idCode: string;
  active: boolean;
  birthday?: Date;
}

interface MemberDocument extends Document {
  _id: { toString: () => string };
  details: MemberDetails;
  bills: Array<{
    _id: { toString: () => string };
    description: string;
    amount: string;
    paid: number;
    date: Date;
    sum: number;
    vatSum?: number;
    discount: number;
    file?: string;
  }>;
  payments: Array<{
    date: Date;
    sum: number;
    info: string;
    bills: Array<{
      sum: number;
      id: string;
    }>;
  }>;
}

/*
 * Admin app views
 */
export const membersPage = async (_: Request, res: Response): Promise<void> => {
  const members = await MemberModel.find()
    .sort({'details.active': -1, 'details.name': 1})
    .populate('bills') as unknown as Array<MemberDocument>;

  const displayData = members.map(member => {
    const balanceRaw = calculateMemberBalance(member);
    const birthdayRaw = member.details.birthday;

    return {
      ...member.details,
      id: member._id,
      balance: utils.displayFormat(balanceRaw ?? 0),
      balanceRaw,
      birthday: birthdayRaw ? birthdayRaw.toLocaleDateString("et-EE", utils.dateFormatOptions) : "",
      birthdayRaw,
    };
  });

  res.render("members", { title: "Liikmed", members: displayData, calculateMemberBalance });
};

export const addMember = (_: Request, res: Response): void => {
  res.render("addMember", { title: "Lisa liige" });
};

export const editMember = async (req: Request, res: Response): Promise<void> => {
  const member = await MemberModel.findById(req.query.id).populate("bills") as unknown as MemberDocument;
  if (!member) {
    res.status(404).send('Member not found');
    return;
  }

  const balanceRaw = calculateMemberBalance(member);
  const birthdayRaw = member.details.birthday;
  const idCode = member.details.idCode;
  const bDayFromIdCode = idCode && idCode.length > 7 ? idCode.substring(5, 7) + "." + idCode.substring(3, 5) : "";
  const birthday = birthdayRaw ? birthdayRaw.toLocaleDateString("et-EE", utils.dateFormatOptions) : bDayFromIdCode;

  const displayData: MemberDisplayData = {
    ...member.details,
    id: member._id.toString(),
    balance: utils.displayFormat(balanceRaw ?? 0),
    balanceRaw: balanceRaw ?? 0,
    birthday,
    birthdayRaw,
    bills: member.bills.sort((a, b) => {
      if (a.paid > 0 && b.paid > 0) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return a.paid - b.paid;
    }),
    billTotal: utils.displayFormat(member.bills.reduce((acc, bill) => 
      acc + utils.getTotalSum({ sum: bill.sum, vatSum: bill.vatSum || 0, discount: bill.discount }), 0)),
    payments: member.payments,
    paymentTotal: utils.displayFormat(member.payments.reduce((acc, payment) => acc + payment.sum, 0)),
  };

  res.render("editMember", { title: "Muuda liikme andmeid", member: displayData });
};

export const updateMember = async (req: Request, res: Response): Promise<void> => {
  const { name, phone, email, student, active, birthday } = req.body;
  const idCode = req.body["id-code"];

  const details: MemberDetails = {
    name,
    phone,
    email,
    student: !!student,
    idCode,
    active: !!active,
  };

  if (birthday) {
    const [day, month] = birthday.split('.');
    const date = new Date(2000, parseInt(month, 10) - 1, parseInt(day, 10));
    date.setHours(0, 0, 0, 0);
    details.birthday = date;
  }

  const member = await MemberModel.findById(req.query.id);
  if (!member) {
    res.status(404).send('Member not found');
    return;
  }

  member.details = details;
  await member.save();
  res.redirect("/members");
};

export const createMember = async (req: Request, res: Response): Promise<void> => {
  const { name, phone, email, student, birthday } = req.body;
  const details: MemberDetails = {
    name,
    phone,
    email,
    student: !!student,
    idCode: req.body["id-code"],
    active: true,
  };

  if (birthday) {
    const [day, month] = birthday.split('.');
    const date = new Date(2000, parseInt(month, 10) - 1, parseInt(day, 10));
    date.setHours(0, 0, 0, 0);
    details.birthday = date;
  }

  await new MemberModel({ details }).save();
  res.redirect("/members");
};

export const deleteMember = async (req: Request, res: Response): Promise<void> => {
  const member = await MemberModel.findById(req.query.id).populate("bills");
  if (!member) {
    res.status(404).send('Member not found');
    return;
  }

  for (const bill of member.bills as Array<{ file?: string; _id: any }>) {
    if (bill.file) {
      try {
        fs.unlinkSync(`${__dirname}/../public/uploads/${bill.file}`);
      } catch(error) {
        console.log(error);
      }
    }
    await BillModel.findByIdAndDelete(bill._id);
  }

  await MemberModel.findByIdAndDelete(req.query.id);
  res.redirect("/members");
};

export const paymentPage = async (req: Request, res: Response): Promise<void> => {
  const member = await MemberModel.findById(req.query.id).populate("bills");
  if (!member) {
    res.status(404).send('Member not found');
    return;
  }
  res.render("addPayment", { title: "Lisa sissemakse", member });
};

export const addPayment = async (req: Request, res: Response): Promise<void> => {
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

  const memberData = await MemberModel.findById(member);
  if (!memberData) {
    res.status(404).send('Member not found');
    return;
  }

  let balance = sum;
  const billsData = await Promise.all(billIds.map(id => BillModel.findById(id)));

  for (const billData of billsData) {
    if (!billData) continue;

    const billSum = utils.getTotalSum({ 
      sum: billData.sum, 
      vatSum: billData.vatSum || 0, 
      discount: billData.discount 
    });
    const { paid } = billData;
    const billInPaymentData = bills.find(bill => bill.id === (billData as any)._id.toString());

    if (paid < billSum) {
      const amountToPay = utils.decimal(billSum - paid);

      if (amountToPay <= balance) {
        billData.paid = utils.decimal(billData.paid + amountToPay);
        if (billInPaymentData) {
          billInPaymentData.sum = amountToPay;
        }
        balance = utils.decimal(balance - amountToPay);
      } else if (balance > 0) {
        const paidSum = utils.decimal(balance);
        billData.paid = utils.decimal(billData.paid + paidSum);
        if (billInPaymentData) {
          billInPaymentData.sum = paidSum;
        }
        balance = 0;
      }
    }

    await billData.save();
  }

  const payments = [...memberData.payments, data];
  memberData.payments = payments;
  await memberData.save();

  res.redirect("/members");
};

export const editPayment = async (req: Request, res: Response): Promise<void> => {
  const member = await MemberModel.findById(req.query.memberId).populate("bills");
  if (!member) {
    res.status(404).send('Member not found');
    return;
  }

  const data = member.payments.find(payment => (payment as any)._id.toString() === req.query.paymentId);
  if (!data) {
    res.status(404).send('Payment not found');
    return;
  }

  res.render("editPayment", { title: "Muuda makse andmeid", member, data });
};

export const updatePayment = async (req: Request, res: Response): Promise<void> => {
  console.log(req.body);
  res.send({ data: "ok" });
};

/*
 * API endpoint methods
 */
export const getMembers = async (_: Request, res: Response): Promise<void> => {
  const members = await MemberModel.find()
    .populate("bills") as unknown as Array<MemberDocument>;
  const data = members.map(member => {
    const balanceRaw = calculateMemberBalance(member);
    return {
      name: member.details.name,
      balanceRaw,
      balance: utils.displayFormat(balanceRaw ?? 0),
      id: member._id,
    };
  });

  data.sort((a, b) => (a.balanceRaw ?? 0) - (b.balanceRaw ?? 0));
  res.send({ data });
};

export const getMemberDetails = async (req: Request, res: Response): Promise<void> => {
  const member = await MemberModel.findById(req.query.id).populate("bills") as unknown as MemberDocument;
  if (!member) {
    res.status(404).send({ message: "Member not found." });
    return;
  }

  const data = {
    name: member.details.name,
    bills: (member.bills as Array<MemberDocument['bills'][0] & { _id: any }>).map(bill => ({
      description: bill.description,
      amount: utils.displayFormat(utils.getTotalSum({ 
        sum: bill.sum, 
        vatSum: bill.vatSum || 0, 
        discount: bill.discount 
      })),
      paid: utils.displayFormat(bill.paid),
      dateTime: bill.date,
      date: bill.date.toLocaleDateString("et-EE"),
      paidRaw: bill.paid,
    })).sort((a, b) => {
      if (a.paidRaw > 0 && b.paidRaw > 0) {
        return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
      }
      return a.paidRaw - b.paidRaw;
    }),
    payments: member.payments.map(item => ({
      description: item.info,
      amount: utils.displayFormat(item.sum),
      dateTime: item.date,
      date: item.date.toLocaleDateString("et-EE"),
      bills: item.bills.map(bill => ({
        description: member.bills.find(billData => 
          billData._id.toString() === bill.id.toString()
        )?.description,
        amount: utils.displayFormat(bill.sum),
      })),
    })),
  };

  res.send({ data });
}; 