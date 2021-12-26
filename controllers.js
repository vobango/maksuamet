const multer = require("multer");
const uuid = require("uuid");
const Member = require("./models/member");
const bill = require("./controllers/bill");

exports.homePage = (_, res) => {
  res.render("index", { title: "Koduleht" });
};

exports.test = (_, res) => {
  res.send({ message: `Hello, world` });
};

// Members
exports.membersPage = async (_, res) => {
  const members = await Member.find();

  res.render("members", { title: "Liikmed", members });
};

exports.addMember = (_, res) => {
  res.render("addMember", { title: "Lisa liige" });
};

exports.createMember = async (req, res) => {
  const { name, phone, email } = req.body;
  const details = {
    name,
    phone,
    email,
    idCode: req.body["id-code"]
  };
  await new Member({ details }).save();

  res.redirect("/members");
};

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
