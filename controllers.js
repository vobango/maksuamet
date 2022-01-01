const multer = require("multer");
const uuid = require("uuid");
const bill = require("./controllers/bill");
const member = require("./controllers/member");
const fs = require("fs");

exports.homePage = (_, res) => {
  res.render("index", { title: "Koduleht" });
};

exports.test = (_, res) => {
  res.send({ message: `Hello, world` });
};

// Members
exports.membersPage = member.membersPage;
exports.addMember = member.addMember;
exports.createMember = member.createMember;

// Bills
exports.billsPage = bill.billsPage;
exports.addBill = bill.addBill;
exports.createBill = bill.createBill;

exports.downloadFile = (req, res) => {
  const file = `${__dirname}/public/uploads/${req.params.filename}`;

  res.download(file);
};

// Utilities
const multerOptions = {
  storage: multer.diskStorage({
    destination: (req, file, next) => {
      next(null, "./public/uploads");
    },
    filename: (req, file, next) => {
      const name = `${uuid.v4()}.${file.mimetype.split("/")[1]}`;
      req.body.file = name;
      next(null, name);
    }
  })
};

exports.upload = multer(multerOptions).single("file");

exports.deleteFile = (req, res, next) => {
  const { filename } = req.query;
  if (filename) {
    try {
      fs.unlinkSync(`${__dirname}/public/uploads/${filename}`);
    } catch(error) {
      console.log(error);
    }
  }

  next();
};
