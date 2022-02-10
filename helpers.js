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

exports.getTotalSum = ({sum, vatSum, discount}) => {
  const total = sum + vatSum;

  if (discount) {
    return total - total * (discount / 100);
  }

  return total;
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
