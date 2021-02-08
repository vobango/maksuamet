const express = require("express");
const controllers = require("./controllers");
const router = express.Router();

router.get("/", controllers.homePage);
router.get("/members", controllers.membersPage);
router.get("/add-member", controllers.addMember);
router.post("/add-member", controllers.createMember);

module.exports = router;
