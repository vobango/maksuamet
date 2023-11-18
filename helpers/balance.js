const numeral = require("numeral");

exports.calculateMemberBalance = (member) => {
  const { bills, payments } = member;

  const billsTotal = bills.reduce((result, bill) => {
    const { sum, vatSum, discount, paid } = bill;
    const total = numeral(sum).add(vatSum).value();

    if (discount) {
      const amount = total - total * (numeral(discount).value() / 100);
      return result + amount;
    }

    return result + (numeral(total).value() - numeral(paid).value());
  }, 0);

  const paymentsTotal = payments.reduce((sum, payment) => {
    return sum + payment.sum;
  }, 0);

  return numeral(paymentsTotal - billsTotal).value();
}
