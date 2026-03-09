import mongoose, { Schema } from 'mongoose';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AutoIncrement = require('mongoose-sequence')(mongoose);

interface SequenceOptions {
  inc_field: string;
  id?: string;
  start_seq?: number;
  inc_amount?: number;
  reference_fields?: string[];
}

export default function sequence(schema: Schema, options: SequenceOptions): void {
  return AutoIncrement(schema, options);
} 