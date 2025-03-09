import numeral from 'numeral';
import { Request, Response, NextFunction } from 'express';

require('numeral/locales/et');
numeral.locale('et');

interface MenuItem {
  title: string;
  slug: string;
}

interface SumValues {
  sum: number | string;
  vatSum: number | string;
  discount?: number | string;
}

export const menu: MenuItem[] = [
  { title: "Liikmed", slug: "/members" },
  { title: "Arved", slug: "/bills" },
];

export const defaultDate = (): string => {
  return new Date().toJSON().slice(0, 10);
};

export const dateInputValue = (date: string | Date): string => {
  return new Date(date).toJSON().slice(0, 10);
};

export const dateFormatOptions: Intl.DateTimeFormatOptions = { 
  day: "2-digit", 
  month: "2-digit" 
};

const decimal = (value: number | string): number => 
  Math.round(parseFloat(value.toString()) * 100) / 100;

export { decimal };

export const getTotalSum = ({ sum, vatSum, discount }: SumValues): number => {
  const total = decimal(sum) + decimal(vatSum);

  if (discount) {
    return total - total * (decimal(discount) / 100);
  }

  return decimal(total);
};

export const displayFormat = (number: number | string): string => {
  return numeral(number).format('0.00 $');
};

export const log = (obj: unknown): string => JSON.stringify(obj, null, 2);

export const ADD = "ADD";
export const SUBTRACT = "SUBTRACT";
export const VAT = 0.2;

export const catchErrors = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return function(req: Request, res: Response, next: NextFunction) {
    return fn(req, res, next).catch(next);
  };
};

export const errorHandler = (err: Error, _: Request, res: Response): void => {
  if (res.status) {
    res.status((err as any).status || 500).render('error', { message: err.message });
  }
}; 