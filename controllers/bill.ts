import { Request, Response } from 'express';
import BillModel from '../models/bill';
import MemberModel from '../models/member';
import * as utils from '../helpers';

interface BillDetails {
  description?: string;
  date: string;
  discount: number;
  handoverDate: string;
  amount: number;
  sum: number;
  vatSum: number;
  file?: string;
}

interface EventData {
  name: string;
  date: number;
  sum: string;
  paid: string;
  bills: Array<{
    amount: string;
    member?: string;
    paid: string;
  }>;
}

interface PopulatedBill extends Document {
  recipient: {
    details: {
      name: string;
    };
  };
}

/*
 * Admin app views
 */
export const billsPage = async (_: Request, res: Response): Promise<void> => {
  const bills = await BillModel.find().populate('recipient').sort({ date: -1, billNumber: -1 });
  res.render("bills", { title: "Arved", bills });
};

export const addBill = async (_: Request, res: Response): Promise<void> => {
  const members = await MemberModel.find();
  res.render("addBill", { title: "Lisa arve", members });
};

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

export const editBill = async (req: Request, res: Response): Promise<void> => {
  const bill = await BillModel.findById(req.query.id).populate('recipient');
  if (!bill) {
    res.status(404).send('Bill not found');
    return;
  }
  res.render("editBill", { title: `Muuda arvet nr ${bill.billNumber}`, bill });
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

/*
 * API endpoints
 */
export const getTotalBalance = async (_: Request, res: Response): Promise<void> => {
  const bills = await BillModel.find();
  const sum = bills.reduce((result, bill) => {
    return result + (bill.paid - utils.getTotalSum({ sum: bill.sum, vatSum: bill.vatSum || 0, discount: bill.discount }));
  }, 0);
  const data = utils.displayFormat(sum);
  res.send({ data });
};

export const getEvents = async (_: Request, res: Response): Promise<void> => {
  const uniqueEvents = await BillModel.distinct("description");
  const events = await Promise.all(
    uniqueEvents.map(event => 
      BillModel.findOne({ description: event }, 'description date')
    )
  );

  res.send({ 
    data: events
      .filter((event): event is NonNullable<typeof event> => event !== null)
      .map(event => ({ 
        name: event.description, 
        date: new Date(event.date).getTime() 
      })) 
  });
};

export const getEventData = async (req: Request, res: Response): Promise<void> => {
  const bills = await BillModel.find({ description: req.query.id })
    .populate({ path: "recipient", select: "details.name" });
  
  if (bills.length === 0) {
    res.status(404).send('No bills found');
    return;
  }

  const sum = bills.reduce((sum, bill) => 
    sum + utils.getTotalSum({ sum: bill.sum, vatSum: bill.vatSum || 0, discount: bill.discount }), 0);
  const paid = bills.reduce((sum, bill) => sum + bill.paid, 0);
  
  const data: EventData = {
    name: req.query.id as string,
    date: new Date(bills[0].date).getTime(),
    sum: utils.displayFormat(sum),
    paid: utils.displayFormat(paid),
    bills: bills.map(bill => ({
      amount: utils.displayFormat(utils.getTotalSum({ sum: bill.sum, vatSum: bill.vatSum || 0, discount: bill.discount })),
      member: (bill as unknown as PopulatedBill).recipient?.details.name,
      paid: utils.displayFormat(bill.paid),
    })),
  };

  res.send({ data });
};

/*
 * Utilities
 */
export const handleCSVUpload = (req: Request, res: Response): void => {
  console.log(req);
  res.send(req.body);
}; 