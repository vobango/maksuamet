import { Request, Response } from 'express';
import BillModel from '../../models/bill';
import MemberModel from '../../models/member';
import * as utils from '../../utils';
import { BillDetails, BillDocument } from './types';
import { MemberDocument } from '../member/types';

const getAvailablePaymentBalance = (payment: any): number => {
  const totalPaidFromPayment = payment.bills.reduce((acc: number, bill: any) => acc + bill.sum, 0);
  return payment.sum - totalPaidFromPayment;
};

export const createBill = async (req: Request, res: Response): Promise<void> => {
  let { sum, date, description, file, handoverDate, amount, recipients, addVat, discount } = req.body;

  sum = parseFloat(sum) || 0;
  discount = parseInt(discount, 10) || 0;
  recipients = Array.isArray(recipients) ? recipients : [recipients];

  const vatSum = addVat ? sum * utils.VAT : 0;
  const totalSum = utils.getTotalSum({ sum, vatSum, discount });

  const details: BillDetails = {
    description,
    date,
    discount,
    handoverDate,
    amount,
    sum,
    vatSum,
    file,
    paid: 0
  };

  for (const recipient of recipients) {
    const fullDetails = { ...details, recipient };
    const bill = await new BillModel(fullDetails).save() as BillDocument;
    
    // Get member with payments
    const member = await MemberModel.findById(recipient) as unknown as MemberDocument;
    
    // Find payments with remaining balance and sort by date
    let remainingBillAmount = totalSum;
    const availablePayments = member.payments
      .map(payment => ({
        payment,
        availableBalance: getAvailablePaymentBalance(payment)
      }))
      .filter(({ availableBalance }) => availableBalance > 0)
      .sort((a, b) => {
        const dateA = a.payment.date ? new Date(a.payment.date).getTime() : 0;
        const dateB = b.payment.date ? new Date(b.payment.date).getTime() : 0;
        return dateA - dateB;
      });

    for (const { payment, availableBalance } of availablePayments) {
      if (remainingBillAmount <= 0) break;
      
      const amountToApply = Math.min(availableBalance, remainingBillAmount);
      
      // Update the bill's paid amount
      bill.paid = (bill.paid || 0) + amountToApply;
      
      // Add bill to payment's bills array
      payment.bills.push({
        id: bill._id.toString(),
        sum: amountToApply
      });
      
      remainingBillAmount -= amountToApply;
    }
    
    // Add bill to member's bills array and save all member changes
    member.bills.push(bill._id);
    await member.save();
    
    // Save the bill
    await bill.save();
  }

  res.redirect("/bills");
};

export const updateBill = async (req: Request, res: Response): Promise<void> => {
  const bill = await BillModel.findById(req.query.id) as BillDocument;

  if (!bill) {
    res.status(404).send(`Bill ${req.query.id} not found`);
    return;
  }

  const { addVat, date, handoverDate, amount, description } = req.body;
  const sum = parseFloat(req.body.sum) || 0;
  const vatSum = addVat ? sum * utils.VAT : 0;
  const discount = parseInt(req.body.discount, 10) || 0;
  
  const oldTotalSum = utils.getTotalSum({ sum: bill.sum, vatSum: bill.vatSum, discount: bill.discount });
  const newTotalSum = utils.getTotalSum({ sum, vatSum, discount });
  
  // If total sum hasn't changed, no need to adjust payments
  if (oldTotalSum === newTotalSum) {
    // Just update the bill data and save
    const newData = {
      vatSum,
      sum,
      discount,
      date,
      handoverDate,
      amount: parseInt(amount, 10) || 1,
      description,
      paid: bill.paid // Keep existing paid amount since total hasn't changed
    };

    Object.assign(bill, newData);
    await bill.save();

    res.redirect("/bills");

    return;
  }

  // Get member with payments
  const member = await MemberModel.findById(bill.recipient) as unknown as MemberDocument;
  
  // Find payments that have this bill
  const paymentsWithBill = member.payments.filter(payment => 
    payment.bills.some(b => b.id.toString() === bill._id.toString())
  );

  if (newTotalSum < oldTotalSum) {
    // If bill total decreased, reduce payment amounts proportionally
    const reduction = oldTotalSum - newTotalSum;
    
    for (const payment of paymentsWithBill) {
      const billInPayment = payment.bills.find(b => b.id.toString() === bill._id.toString());
      if (billInPayment) {
        billInPayment.sum = Math.max(0, billInPayment.sum - reduction);
      }
    }
  } else if (newTotalSum > oldTotalSum) {
    // If bill total increased, try to cover the increase with existing or new payments
    const increase = newTotalSum - oldTotalSum;
    let remainingIncrease = increase;

    // First try to use existing payments that already have this bill
    for (const payment of paymentsWithBill) {
      const availableBalance = getAvailablePaymentBalance(payment);
      if (availableBalance > 0 && remainingIncrease > 0) {
        const amountToApply = Math.min(availableBalance, remainingIncrease);
        const billInPayment = payment.bills.find(b => b.id.toString() === bill._id.toString());
        if (billInPayment) {
          billInPayment.sum += amountToApply;
          remainingIncrease -= amountToApply;
        }
      }
    }

    // If there's still remaining increase, look for new payments
    if (remainingIncrease > 0) {
      const availablePayments = member.payments
        .filter(payment => !payment.bills.some(b => b.id.toString() === bill._id.toString()))
        .map(payment => ({
          payment,
          availableBalance: getAvailablePaymentBalance(payment)
        }))
        .filter(({ availableBalance }) => availableBalance > 0)
        .sort((a, b) => {
          const dateA = a.payment.date ? new Date(a.payment.date).getTime() : 0;
          const dateB = b.payment.date ? new Date(b.payment.date).getTime() : 0;
          return dateA - dateB;
        });

      for (const { payment, availableBalance } of availablePayments) {
        if (remainingIncrease <= 0) break;
        
        const amountToApply = Math.min(availableBalance, remainingIncrease);
        payment.bills.push({
          id: bill._id.toString(),
          sum: amountToApply
        });
        
        remainingIncrease -= amountToApply;
      }
    }
  }

  // Calculate total paid amount from all payments
  const totalPaid = member.payments.reduce((acc, payment) => {
    const billPayment = payment.bills.find(b => b.id.toString() === bill._id.toString());
    return acc + (billPayment?.sum || 0);
  }, 0);

  const newData = {
    vatSum,
    sum,
    discount,
    date,
    handoverDate,
    amount: parseInt(amount, 10) || 1,
    description,
    paid: totalPaid
  };

  Object.assign(bill, newData);

  // Save both member and bill
  await member.save();
  await bill.save();

  res.redirect("/bills");
};

export const deleteBill = async (req: Request, res: Response): Promise<void> => {
  const bill = await BillModel.findById(req.query.id) as BillDocument;

  if (!bill) {
    res.status(404).send(`Bill ${req.query.id} not found`);
    return;
  }

  // Get member with payments
  const member = await MemberModel.findById(bill.recipient) as unknown as MemberDocument;
  
  // Remove bill from member's bills array
  member.bills = member.bills.filter(b => b.toString() !== bill._id.toString());
  
  // Remove bill from any payments that reference it
  member.payments = member.payments.map(payment => ({
    ...payment,
    bills: payment.bills.filter(b => b.id.toString() !== bill._id.toString())
  }));

  // Save member changes
  await member.save();

  // Delete the bill
  await BillModel.findByIdAndDelete(req.query.id);

  res.redirect("/bills");
};

export const handleCSVUpload = (req: Request, res: Response): void => {
  res.send(req.body);
}; 