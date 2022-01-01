const express = require("express");
const controllers = require("./controllers");
const billController = require("./controllers/bill");
const memberController = require("./controllers/member");
const router = express.Router();

router.get("/", controllers.homePage);
router.get("/members", controllers.membersPage);
router.get("/add-member", controllers.addMember);
router.post("/add-member", controllers.createMember);
router.get("/edit-member", memberController.editMember);
router.post("/edit-member", memberController.updateMember);
router.get("/delete-member", memberController.deleteMember);
router.get("/bills", controllers.billsPage);
router.get("/add-bill", controllers.addBill);
router.post("/add-bill", controllers.upload, controllers.createBill);
router.get("/edit-bill", billController.editBill);
router.post("/edit-bill", billController.updateBill);
router.get("/delete-bill", controllers.deleteFile, billController.deleteBill);
router.post("/upload-data", controllers.upload, billController.handleCSVUpload);
router.get("/public/uploads/:filename", controllers.downloadFile);
router.get("/api/test", controllers.test);

module.exports = router;
