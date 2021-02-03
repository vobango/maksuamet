const path = require("path");
const express = require("express");
const app = express();
const connectDb = require("./database");
const User = require("./models/user");

const port = 8080;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_, res) => {
  res.render("index");
});

app.get("/add-user", async (req, res) => {
  const userName = req.query.name || "Test User";
  const user = new User({
    details: {
      name: userName
    }
  });

  await user.save().then(() => {
    console.log(`Created user ${userName}`);
  });

  res.send("User created! \n");
});

app.get("/users", async (req, res) => {
  const users = await User.find();

  res.json(users);
});

app.listen(port, () => {
  console.log("Server is running");
});

connectDb().then(() => {
  console.log("Database connected");
});
