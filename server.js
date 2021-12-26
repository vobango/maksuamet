require('dotenv').config();
const app = require("./app")
const connectDb = require("./database");

const port = process.env.PORT || 8001;

app.listen(port, () => {
  console.clear();
  console.log(`Server is running on port ${ port }`);
});

connectDb().then(() => {
  console.log("Database connected");
});
