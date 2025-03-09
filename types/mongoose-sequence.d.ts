declare module 'mongoose-sequence' {
  import { Schema } from 'mongoose';
  
  interface SequenceOptions {
    inc_field: string;
    id?: string;
    start_seq?: number;
    inc_amount?: number;
    reference_fields?: string[];
  }

  interface AutoIncrement {
    (schema: Schema, options: SequenceOptions): void;
  }

  const AutoIncrement: AutoIncrement;
  export default AutoIncrement;
} 