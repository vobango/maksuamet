import numeral from "numeral";

interface Bill {
  sum: number;
  vatSum?: number;
  discount?: number;
}

interface Payment {
  sum: number;
}

interface Member {
  bills: Bill[];
  payments: Payment[];
}

export const calculateMemberBalance = (member: Member): number => {
  const { bills, payments } = member;

  const billsTotal = bills.reduce((result, bill) => {
    const { sum, vatSum = 0, discount } = bill;
    const total = numeral(sum).add(vatSum).value() ?? 0;

    if (discount) {
      const amount = total - total * ((numeral(discount).value() ?? 0) / 100);
      return result + amount;
    }

    return result + (numeral(total).value() ?? 0);
  }, 0);

  const paymentsTotal = payments.reduce((sum, payment) => {
    return sum + payment.sum;
  }, 0);

  return numeral(paymentsTotal - billsTotal).value() ?? 0;
} 