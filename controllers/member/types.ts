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
  phone?: string;
  email?: string;
  student: boolean;
  idCode: string;
  active: boolean;
  birthday?: Date;
}

export interface MemberDocument extends Document {
  _id: { toString: () => string };
  details: MemberDetails;
  bills: Array<{
    _id: { toString: () => string };
    description: string;
    amount: string;
    paid: number;
    date: Date;
    sum: number;
    vatSum?: number;
    discount: number;
    file?: string;
  }>;
  payments: Array<{
    date: Date;
    sum: number;
    info: string;
    bills: Array<{
      sum: number;
      id: string;
    }>;
  }>;
} 