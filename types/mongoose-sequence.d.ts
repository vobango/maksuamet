declare module 'mongoose-sequence' {
  import { Schema } from 'mongoose';

  interface AutoIncrementOptions {
    inc_field: string;
    start_seq?: number;
  }

  function autoIncrement(schema: Schema, options: AutoIncrementOptions): void;
  export default autoIncrement;
} 