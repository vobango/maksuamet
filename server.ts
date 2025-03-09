import dotenv from 'dotenv';
import app from './app';
import connectDb from './database';

dotenv.config();

const port: number = parseInt(process.env.PORT || '8001', 10);

app.listen(port, () => {
  console.clear();
  console.log(`Server is running on port ${port}`);
});

connectDb().then(() => {
  console.log("Database connected");
}); 