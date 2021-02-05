const express = require("express")
const controllers = require("./controllers")
const router = express.Router()
const User = require("./models/user")

router.get("/", controllers.homePage);

router.get("/add-user", async (req, res) => {
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

router.get("/users", async (req, res) => {
  const users = await User.find();

  res.json(users);
});

module.exports = router;
