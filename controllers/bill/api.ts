import { Request, Response } from 'express';
import BillModel from '../../models/bill';
import MemberModel from '../../models/member';
import * as utils from '../../utils';
import { EventData, PopulatedBill } from './types';
import { calculateMemberBalance } from '../../helpers/balance';
import { MemberDocument } from '../member/types';

export const getTotalBalance = async (_: Request, res: Response): Promise<void> => {
  const members = await MemberModel.find().populate('bills') as unknown as Array<MemberDocument>;
  
  const totalBalance = members.reduce((acc, member) => {
    const memberBalance = calculateMemberBalance(member);
    return acc + (memberBalance ?? 0);
  }, 0);

  const data = utils.displayFormat(totalBalance);

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
        date: new Date(event.date).getTime(),
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