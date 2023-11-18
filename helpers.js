const {Role, roles} = require("./models/role");
const numeral = require("numeral");
require('numeral/locales/et');
numeral.locale('et');

exports.menu = [
  { title: "Liikmed", slug: "/members" },
  { title: "Arved", slug: "/bills" },
];

exports.defaultDate = () => {
  return new Date().toJSON().slice(0, 10);
};

exports.dateInputValue = (date) => {
  return new Date(date).toJSON().slice(0, 10);
};

exports.dateFormatOptions = { day: "2-digit", month: "2-digit" };

const decimal = (value) => Math.round(parseFloat(value) * 100) / 100;
exports.decimal = decimal;

exports.getTotalSum = ({sum, vatSum, discount}) => {
  const total = decimal(sum) + decimal(vatSum);

  if (discount) {
    return total - total * (decimal(discount) / 100);
  }

  return decimal(total);
};

exports.displayFormat = (number) => {
  return numeral(number).format('0.00 $');
};

exports.log = (obj) => JSON.stringify(obj, null, 2);

exports.ADD = "ADD";
exports.SUBTRACT = "SUBTRACT";
exports.VAT = 0.2;

exports.catchErrors = (fn) => {
  return function(req, res, next) {
    return fn(req, res, next).catch(next);
  };
};

exports.errorHandler = (err, _, res) => {
  if (res.status) {
    res.status(err.status || 500).render('error', { message: err.message });
  }
};

exports.addInitialRoles = () => {
  Role.estimatedDocumentCount((err, count) => {
    if (err) {
      console.log('Error checking roles', err);

      return;
    }

    if (count > 0) {
      return;
    }

    roles.forEach(role => {
      new Role({ name: role }).save(err => {
        if (err) {
          console.log('Error saving role', err);
        }

        console.log(`Added ${role} to roles collection`);
      });
    });
  })
};
