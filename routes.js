const express = require("express");
const controllers = require("./controllers");
const router = express.Router();

router.get("/", controllers.homePage);
router.get("/members", controllers.membersPage);
router.get("/add-member", controllers.addMember);
router.post("/add-member", controllers.createMember);
router.get("/bills", controllers.billsPage);
router.get("/add-bill", controllers.addBill);
router.post("/add-bill", controllers.upload, controllers.createBill);
router.get("/public/uploads/:filename", controllers.downloadFile);
router.get("/api/test", controllers.test);

module.exports = router;
