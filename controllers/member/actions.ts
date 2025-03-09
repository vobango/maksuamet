import { Request, Response } from 'express';
import fs from 'fs';
import MemberModel from '../../models/member';
import BillModel from '../../models/bill';
import * as utils from '../../utils';
import { MemberDetails } from './types';

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
        fs.unlinkSync(`${__dirname}/../../public/uploads/${bill.file}`);
      } catch(error) {
        console.log(error);
      }
    }
    await BillModel.findByIdAndDelete(bill._id);
  }

  await MemberModel.findByIdAndDelete(req.query.id);
  res.redirect("/members");
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

export const updatePayment = async (req: Request, res: Response): Promise<void> => {
  console.log(req.body);
  res.send({ data: "ok" });
}; 