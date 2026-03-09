import mongoose, { Document } from 'mongoose';
import type { Bill } from './bill';

interface Payment {
  date: Date;
  sum: number;
  info: string;
  bills: Array<{
    sum: number;
    id: mongoose.Types.ObjectId;
  }>;
}

interface MemberDetails {
  name: string;
  email?: string;
  phone?: string;
  idCode: string;
  birthday?: Date;
  active: boolean;
  student: boolean;
}

interface Member extends Document {
  type: string;
  payments: Payment[];
  bills: mongoose.Types.ObjectId[];
  details: MemberDetails;
}

const memberSchema = new mongoose.Schema<Member>({
  type: {
    type: String,
    default: "MEMBER"
  },
  payments: [{
    date: Date,
    sum: Number,
    info: String,
    bills: [{
      sum: Number,
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Bill" }
    }]
  }],
  bills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bill" }],
  details: {
    name: {
      type: String,
      required: [true, "Nimi on kohustuslik"]
    },
    email: String,
    phone: String,
    idCode: {
      type: String,
      unique: true
    },
    birthday: Date,
    active: {
      type: Boolean,
      default: true
    },
    student: {
      type: Boolean,
      default: false
    }
  }
});

const MemberModel = mongoose.model<Member>("Member", memberSchema);

export default MemberModel; 