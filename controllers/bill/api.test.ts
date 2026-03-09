import { expect } from 'chai';
import { calculateTotalBalance, calculatePaymentAmountAndBalance } from './apiHelpers';
import { Bill } from './types';

describe('calculateTotalBalance', () => {
  it('should calculate total balance for a single bill', () => {
    const bills: Bill[] = [{
      paid: 100,
      sum: 80,
      vatSum: 20,
      discount: 10 // 10% discount of (80 + 20) = 10
    }];

    const balance = calculateTotalBalance(bills);
    expect(balance).to.equal(10); // 100 - (100 - 10) = 10
  });

  it('should calculate total balance for multiple bills', () => {
    const bills: Bill[] = [
      {
        paid: 100,
        sum: 80,
        vatSum: 20,
        discount: 10 // 10% discount of (80 + 20) = 10
      },
      {
        paid: 50,
        sum: 40,
        vatSum: 10,
        discount: 5 // 5% discount of (40 + 10) = 2.5
      }
    ];

    const balance = calculateTotalBalance(bills);
    expect(balance).to.equal(12.5); // (100 - (100 - 10)) + (50 - (50 - 2.5)) = 10 + 2.5
  });

  it('should handle bills with missing vatSum', () => {
    const bills: Bill[] = [{
      paid: 100,
      sum: 80,
      discount: 10 // 10% discount of 80 = 8
    }];

    const balance = calculateTotalBalance(bills);
    expect(balance).to.equal(28); // 100 - (80 + 0 - 8)
  });

  it('should return 0 for empty bills array', () => {
    const balance = calculateTotalBalance([]);
    expect(balance).to.equal(0);
  });
});

describe('calculatePaymentAmountAndBalance', () => {
  it('should return full unpaid amount when balance is sufficient', () => {
    const result = calculatePaymentAmountAndBalance(100, 60, 50);
    expect(result.amountToPay).to.equal(40);
    expect(result.remainingBalance).to.equal(10);
  });

  it('should return partial amount when balance is insufficient', () => {
    const result = calculatePaymentAmountAndBalance(100, 60, 30);
    expect(result.amountToPay).to.equal(30);
    expect(result.remainingBalance).to.equal(0);
  });

  it('should return zero amount when bill is fully paid', () => {
    const result = calculatePaymentAmountAndBalance(100, 100, 50);
    expect(result.amountToPay).to.equal(0);
    expect(result.remainingBalance).to.equal(50);
  });

  it('should return zero amount when balance is zero', () => {
    const result = calculatePaymentAmountAndBalance(100, 60, 0);
    expect(result.amountToPay).to.equal(0);
    expect(result.remainingBalance).to.equal(0);
  });
}); 