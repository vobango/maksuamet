import { Request, Response } from 'express';
import BillModel from '../../models/bill';
import MemberModel from '../../models/member';
import * as utils from '../../helpers';
import { BillDetails } from './types';

export const createBill = async (req: Request, res: Response): Promise<void> => {
  let { sum, date, description, file, handoverDate, amount, recipients, addVat, discount } = req.body;
  sum = parseFloat(sum) || 0;
  discount = parseInt(discount, 10) || 0;
  recipients = Array.isArray(recipients) ? recipients : [recipients];

  const vatSum = addVat ? sum * utils.VAT : 0;
  const details: BillDetails = {
    description,
    date,
    discount,
    handoverDate,
    amount,
    sum,
    vatSum,
    file
  };

  for (const recipient of recipients) {
    const fullDetails = { ...details, recipient };
    const bill = await new BillModel(fullDetails).save();
    await MemberModel.findByIdAndUpdate(recipient, { $addToSet: { bills: bill._id } });
  }

  res.redirect("/bills");
};

export const updateBill = async (req: Request, res: Response): Promise<void> => {
  const bill = await BillModel.findById(req.query.id);
  if (!bill) {
    res.status(404).send('Bill not found');
    return;
  }

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

  Object.assign(bill, newData);
  await bill.save();
  res.redirect("/bills");
};

export const deleteBill = async (req: Request, res: Response): Promise<void> => {
  const bill = await BillModel.findById(req.query.id);
  if (!bill) {
    res.status(404).send('Bill not found');
    return;
  }
  await MemberModel.findByIdAndUpdate(bill.recipient, { $pull: { bills: bill._id } });
  await BillModel.findByIdAndDelete(req.query.id);
  res.redirect("/bills");
};

export const handleCSVUpload = (req: Request, res: Response): void => {
  console.log(req);
  res.send(req.body);
}; 