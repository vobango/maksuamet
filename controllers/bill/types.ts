import { Document } from 'mongoose';

export interface BillDetails {
  description?: string;
  date: string;
  discount: number;
  handoverDate: string;
  amount: number;
  sum: number;
  vatSum: number;
  file?: string;
}

export interface EventData {
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

export interface PopulatedBill extends Document {
  recipient: {
    details: {
      name: string;
    };
  };
} 