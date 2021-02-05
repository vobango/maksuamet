const app = require("./app")
const connectDb = require("./database");

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log("Server is running");
});

connectDb().then(() => {
  console.log("Database connected");
});
