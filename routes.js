const express = require("express");
const controllers = require("./controllers");
const router = express.Router();

router.get("/", controllers.homePage);
router.get("/members", controllers.membersPage);
router.get("/add-member", controllers.addMember);
router.post("/add-member", controllers.createMember);
router.get("/add-bill", controllers.addBill);
router.post("/add-bill", controllers.createBill);

module.exports = router;
