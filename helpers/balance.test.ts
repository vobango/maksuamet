import { describe, it } from 'mocha';
import assert from 'assert';
import { calculateMemberBalance } from "./balance";

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

describe('calculateMemberBalance', () => {
  it('calculates the balance of a member', () => {
    const member: Member = {
      bills: [
        { sum: 10, vatSum: 0, discount: 0 },
        { sum: 20, vatSum: 0, discount: 0 },
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
    const member: Member = {
      bills: [
        { sum: 10, vatSum: 0, discount: 10 },
      ],
      payments: [
        { sum: 9 },
      ],
    };

    const result = calculateMemberBalance(member);

    assert.equal(result, 0);
  });

  it('calculates the balance of a member with VAT', () => {
    const member: Member = {
      bills: [
        { sum: 10, vatSum: 2.2, discount: 0 },
      ],
      payments: [
        { sum: 12.2 },
      ],
    };

    const result = calculateMemberBalance(member);

    assert.equal(result, 0);
  });

  it('calculates the balance of a member with no payments', () => {
    const member: Member = {
      bills: [
        { sum: 10, vatSum: 0, discount: 0 },
      ],
      payments: [],
    };

    const result = calculateMemberBalance(member);

    assert.equal(result, -10);
  });
}); 