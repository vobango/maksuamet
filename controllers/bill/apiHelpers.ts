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