import { Request, Response } from 'express';
import BillModel from '../../models/bill';
import MemberModel from '../../models/member';
import {displayFormat} from '../../utils';

export const billsPage = async (_: Request, res: Response): Promise<void> => {
  const data = await BillModel.find().populate('recipient').sort({ date: -1, billNumber: -1 });
  const bills = data.map(bill => {
    return {
      ...bill,
      paid: displayFormat(bill.paid)
    }
  })

  res.render("bills", { title: "Arved", bills });
};

export const addBill = async (_: Request, res: Response): Promise<void> => {
  const members = await MemberModel.find();

  res.render("addBill", { title: "Lisa arve", members });
};

export const editBill = async (req: Request, res: Response): Promise<void> => {
  const bill = await BillModel.findById(req.query.id).populate('recipient');

  if (!bill) {
    res.status(404).send('Bill not found');
   
    return;
  }

  res.render("editBill", { title: `Muuda arvet nr ${bill.billNumber}`, bill });
}; 
