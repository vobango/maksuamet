import { Request, Response } from 'express';
import MemberModel from '../../models/member';
import * as utils from '../../utils';
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
    balance: utils.displayFormat(calculateMemberBalance(member)),
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
      date: item.date?.toLocaleDateString("et-EE"),
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

export const getBirthdays = async (_: Request, res: Response): Promise<void> => {
  const members = await MemberModel.find();

  const data = members.map(member => ({
    name: member.details.name,
    birthday: member.details.birthday?.toLocaleDateString("et-EE", { day: "2-digit", month: "2-digit" }) ?? "",
    active: member.details.active,
  }));

  res.send({ data });
};

export const fixPrepaidBalances = async (_: Request, res: Response): Promise<void> => {
  const members = await MemberModel.find().populate("bills") as unknown as Array<MemberDocument>;

  for (const member of members) {
    try {
      const allBillsInPayments = member.payments.flatMap(payment => payment.bills).map(bill => bill.id);
      const prePaidBills = (member.bills as Array<MemberDocument['bills'][0] & { _id: any }>).filter(bill => {
        return bill.paid > 0 && allBillsInPayments.indexOf(bill._id.toString()) === -1;
      });

      if (prePaidBills.length > 0) {
        const prePaidSum = prePaidBills.reduce((acc, bill) => acc + utils.decimal(bill.paid), 0);
        const newPayment = {
          bills: prePaidBills.map(bill => ({ sum: bill.paid, id: bill._id })),
          sum: prePaidSum,
          info: "Tasaarveldus vanade arvetega",
          date: new Date(),
        };

        const payments = [...member.payments, newPayment];
        member.payments = payments;
        await member.save();
      }
    } catch (e) {
      res.send(e);
      return;
    }
  }

  res.send({ data: 'ok' });
}; 