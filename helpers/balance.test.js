var assert = require('assert');
const {calculateBalance, calculateMemberBalance} = require("./balance");
const utils = require("../helpers");

describe('calculateBalance', () => {
  it('adds the amount to the baseBalance', () => {
    const amount = 10;
    const baseBalance = 10;

    const result = calculateBalance(amount, baseBalance, utils.ADD);

    assert.equal(result, 20);
  });

  it('subtracts the amount from the baseBalance', () => {
    const amount = 10;
    const baseBalance = 20;

    const result = calculateBalance(amount, baseBalance, utils.SUBTRACT);

    assert.equal(result, 10);
  });
});

describe('calculateMemberBalance', () => {
  it('calculates the balance of a member', () => {
    const member = {
      bills: [
        { amount: 10, vatSum: 0, discount: 0 },
        { amount: 20, vatSum: 0, discount: 0 },
      ],
      payments: [
        { sum: 10 },
        { sum: 20 },
      ],
    };

    const result = calculateMemberBalance(member);

    assert.equal(result, 0);
  });

  it('calculates the balance of a member with discount', () => {
    const member = {
      bills: [
        { amount: 10, vatSum: 0, discount: 10 },
      ],
      payments: [
        { sum: 9 },
      ],
    };

    const result = calculateMemberBalance(member);

    assert.equal(result, 0);
  });

  it('calculates the balance of a member with VAT', () => {
    const member = {
      bills: [
        { amount: 10, vatSum: 2.2, discount: 0 },
      ],
      payments: [
        { sum: 12.2 },
      ],
    };

    const result = calculateMemberBalance(member);

    assert.equal(result, 0);
  });
});
