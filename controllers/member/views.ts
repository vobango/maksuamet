import { Request, Response } from 'express';
import MemberModel from '../../models/member';
import * as utils from '../../utils';
import { calculateMemberBalance } from '../../helpers/balance';
import { MemberDocument, MemberDisplayData } from './types';

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

export const paymentPage = async (req: Request, res: Response): Promise<void> => {
  const member = await MemberModel.findById(req.query.id).populate("bills");
  if (!member) {
    res.status(404).send('Member not found');
    return;
  }
  res.render("addPayment", { title: "Lisa sissemakse", member });
};

export const editPayment = async (req: Request, res: Response): Promise<void> => {
  const member = await MemberModel.findById(req.query.memberId).populate("bills") as unknown as MemberDocument;
  const data = member.payments.find(payment => (payment as any)._id.toString() === req.query.paymentId);
  
  console.log('Payment data:', data);
  console.log(member.bills.map(bill => bill._id.toString()).includes(data?.bills[0].id.toString()))
  

  res.render("editPayment", { 
    title: "Muuda makse andmeid", 
    member, 
    data,
    paymentId: req.query.paymentId,
    memberId: req.query.memberId
  });
}; 