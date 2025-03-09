import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const clusterName: string = process.env.DB_CLUSTER || "test-base";
const hostname: string = process.env.DB_HOST || "localhost";
const connection: string = `mongodb://${hostname}:27017/${clusterName}`;
console.log('Connecting to', connection);

const connectDb = (): Promise<typeof mongoose> => 
  mongoose.connect(connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  } as mongoose.ConnectOptions);

// Import models
import './models/bill';
import './models/member';

export default connectDb; 