import mongoose, { Document } from 'mongoose';
import AutoIncrement from 'mongoose-sequence';

export interface Bill extends Document {
  date: Date;
  handoverDate: Date;
  sum: number;
  description?: string;
  amount: number;
  file?: string;
  recipient: mongoose.Types.ObjectId;
  vatSum?: number;
  discount: number;
  paid: number;
  billNumber: number;
}

const billSchema = new mongoose.Schema<Bill>({
  date: {
    default: Date.now,
    type: Date
  },
  handoverDate: {
    default: Date.now,
    type: Date
  },
  sum: {
    type: Number,
    required: [true, "Summa on kohustuslik"]
  },
  description: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    default: 1
  },
  file: String,
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
  vatSum: Number,
  discount: {
    type: Number,
    default: 0
  },
  paid: {
    type: Number,
    default: 0
  }
});

billSchema.plugin(AutoIncrement, { inc_field: "billNumber", start_seq: 1000 });

const BillModel = mongoose.model<Bill>("Bill", billSchema);

export default BillModel; 