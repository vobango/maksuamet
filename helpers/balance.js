const utils = require("../helpers");

exports.calculateBalance = (amount, baseBalance, transaction) => {
  const value = utils.decimal(amount);
  let balance = 0;

  if (transaction === utils.ADD) {
    balance = utils.decimal(baseBalance) + value;
  }

  if (transaction === utils.SUBTRACT) {
    balance = utils.decimal(baseBalance) - value;
  }

  return utils.decimal(balance);
};

exports.calculateMemberBalance = (member) => {
  const { bills, payments } = member;

  // Balance = all bills - all payments
  const billsTotal = bills.reduce((sum, bill) => {
    const { amount, vatSum, discount } = bill;
    const total = utils.decimal(amount) + utils.decimal(vatSum);

    if (discount) {
      const amount = total - total * (utils.decimal(discount) / 100);
      return sum + amount;
    }

    return sum + utils.decimal(total);
  }, 0);

  const paymentsTotal = payments.reduce((sum, payment) => {
    return sum + payment.sum;
  }, 0);

  return utils.decimal(billsTotal - paymentsTotal);
}
