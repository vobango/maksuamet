import { Request, Response } from 'express';
import MemberModel from '../../models/member';
import * as utils from '../../helpers';
import { calculateMemberBalance } from '../../helpers/balance';
import { MemberDocument } from './types';

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