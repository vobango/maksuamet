import * as utils from '../../utils';
import { Bill } from './types';

export const calculateTotalBalance = (bills: Array<Bill>): number => {
  return bills.reduce((result, bill) => {
    return result + (bill.paid - utils.getTotalSum({ 
      sum: bill.sum, 
      vatSum: bill.vatSum || 0, 
      discount: bill.discount 
    }));
  }, 0);
};

interface PaymentCalculationResult {
  amountToPay: number;
  remainingBalance: number;
}

export const calculatePaymentAmountAndBalance = (
  billSum: number,
  currentPaid: number,
  availableBalance: number
): PaymentCalculationResult => {
  if (currentPaid >= billSum) {
    return { amountToPay: 0, remainingBalance: availableBalance };
  }

  const unpaidAmount = utils.decimal(billSum - currentPaid);

  if (unpaidAmount <= availableBalance) {
    return {
      amountToPay: unpaidAmount,
      remainingBalance: utils.decimal(availableBalance - unpaidAmount)
    };
  }

  return {
    amountToPay: availableBalance > 0 ? utils.decimal(availableBalance) : 0,
    remainingBalance: 0
  };
}; 