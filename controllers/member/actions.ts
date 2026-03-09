import { Request, Response } from 'express';
import fs from 'fs';
import MemberModel from '../../models/member';
import BillModel from '../../models/bill';
import * as utils from '../../utils';
import { MemberDetails } from './types';
import { calculatePaymentAmountAndBalance } from '../bill/apiHelpers';

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
      } catch (error) {
        res.status(500).send("Error deleting member");
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

    const { amountToPay, remainingBalance } = calculatePaymentAmountAndBalance(billSum, paid, balance);
    
    if (amountToPay > 0) {
      billData.paid = utils.decimal(billData.paid + amountToPay);
      if (billInPaymentData) {
        billInPaymentData.sum = amountToPay;
      }
      balance = remainingBalance;
    }

    await billData.save();
  }

  const payments = [...memberData.payments, data];
  memberData.payments = payments;
  await memberData.save();

  res.redirect("/members");
};

export const updatePayment = async (req: Request, res: Response): Promise<void> => {
  const { bills: selectedBills, amount, info, member, date, paymentId } = req.body;
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

  const oldPayment = memberData.payments.find(p => (p as any)._id.toString() === paymentId);
  if (!oldPayment) {
    res.status(404).send('Payment not found');
    return;
  }

  // Reset the paid amounts from the old payment
  const oldBillsData = await Promise.all(oldPayment.bills.map(bill => BillModel.findById(bill.id)));
  for (const billData of oldBillsData) {
    if (!billData) continue;
    billData.paid = utils.decimal(billData.paid - (oldPayment.bills.find(b => b.id === (billData as any)._id.toString())?.sum || 0));
    await billData.save();
  }

  // Apply the new payment amounts
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

    const { amountToPay, remainingBalance } = calculatePaymentAmountAndBalance(billSum, paid, balance);
    
    if (amountToPay > 0) {
      billData.paid = utils.decimal(billData.paid + amountToPay);
      if (billInPaymentData) {
        billInPaymentData.sum = amountToPay;
      }
      balance = remainingBalance;
    }

    await billData.save();
  }

  // Update the payment in the array
  memberData.payments = memberData.payments.map(p => 
    (p as any)._id.toString() === paymentId ? { ...data, _id: (p as any)._id } : p
  );

  await memberData.save();

  res.redirect("/members");
}; 