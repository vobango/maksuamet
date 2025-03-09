import { Document } from 'mongoose';

export interface MemberDisplayData {
  name: string;
  email?: string;
  phone?: string;
  idCode: string;
  birthday?: string;
  birthdayRaw?: Date;
  active: boolean;
  student: boolean;
  id: string;
  balance: string;
  balanceRaw: number;
  bills: Array<{
    description: string;
    amount: string;
    paid: number;
    date: Date;
  }>;
  billTotal: string;
  payments: Array<{
    date: Date;
    sum: number;
    info: string;
    bills: Array<{
      sum: number;
      id: string;
    }>;
  }>;
  paymentTotal: string;
}

export interface MemberDetails {
  name: string;
  phone: string;
  email: string;
  student: boolean;
  idCode: string;
  active: boolean;
  birthday?: Date;
}

export interface Payment {
  _id?: any;
  date: Date;
  sum: number;
  info: string;
  bills: Array<{
    sum: number;
    id: string;
  }>;
}

export interface MemberDocument extends Document {
  _id: { toString: () => string };
  details: MemberDetails;
  bills: Array<any>;
  payments: Array<Payment>;
} 