const express = require("express");
const controllers = require("./controllers");
const billController = require("./controllers/bill");
const memberController = require("./controllers/member");
const { catchErrors } = require("./helpers");
const router = express.Router();

// Admin app
router.get("/", controllers.homePage);
router.get("/members", controllers.membersPage);
router.get("/add-member", controllers.addMember);
router.post("/add-member", catchErrors(controllers.createMember));
router.get("/edit-member", catchErrors(memberController.editMember));
router.post("/edit-member", catchErrors(memberController.updateMember));
router.get("/delete-member", catchErrors(memberController.deleteMember));
router.get("/add-payment", catchErrors(controllers.paymentPage));
router.post("/add-payment", catchErrors(controllers.addPayment));
router.get("/edit-payment", catchErrors(controllers.editPayment));
router.post("/edit-payment", catchErrors(controllers.updatePayment));
router.get("/bills", controllers.billsPage);
router.get("/add-bill", controllers.addBill);
router.post("/add-bill", controllers.upload, catchErrors(controllers.createBill));
router.get("/edit-bill", catchErrors(billController.editBill));
router.post("/edit-bill", catchErrors(billController.updateBill));
router.get("/delete-bill", controllers.deleteFile, catchErrors(billController.deleteBill));
router.post("/upload-data", controllers.upload, catchErrors(billController.handleCSVUpload));
router.get("/public/uploads/:filename", controllers.downloadFile);

// API
router.get("/api/test", controllers.test);
router.get("/api/members", catchErrors(memberController.getMembers));
router.get("/api/member", catchErrors(memberController.getMemberDetails));
router.get("/api/events", catchErrors(billController.getEvents));
router.get("/api/event", catchErrors(billController.getEventData));
router.get("/api/totalBalance", catchErrors(memberController.getTotalBalance));
router.get("/api/birthdays", catchErrors(memberController.getBirthdays));

module.exports = router;
