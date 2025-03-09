import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import uuid from 'uuid';
import fs from 'fs';
import * as billController from './controllers/bill';
import * as memberController from './controllers/member';

export const homePage = (_: Request, res: Response): void => {
  res.render("index", { title: "Koduleht" });
};

export const test = (_: Request, res: Response): void => {
  res.send({ message: `Hello, world` });
};

// Members
export const membersPage = memberController.membersPage;
export const addMember = memberController.addMember;
export const createMember = memberController.createMember;

// Payments
export const paymentPage = memberController.paymentPage;
export const addPayment = memberController.addPayment;
export const editPayment = memberController.editPayment;
export const updatePayment = memberController.updatePayment;

// Bills
export const billsPage = billController.billsPage;
export const addBill = billController.addBill;
export const createBill = billController.createBill;

export const downloadFile = (req: Request, res: Response): void => {
  const file = `${__dirname}/public/uploads/${req.params.filename}`;
  res.download(file);
};

// Utilities
const multerOptions: multer.Options = {
  storage: multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, next: (error: Error | null, destination: string) => void) => {
      next(null, "./public/uploads");
    },
    filename: (req: Request, file: Express.Multer.File, next: (error: Error | null, filename: string) => void) => {
      const name = `${uuid.v4()}.${file.mimetype.split("/")[1]}`;
      (req.body as any).file = name;
      next(null, name);
    }
  })
};

export const upload = multer(multerOptions).single("file");

export const deleteFile = (req: Request, _res: Response, next: NextFunction): void => {
  const { filename } = req.query;
  if (filename) {
    try {
      fs.unlinkSync(`${__dirname}/public/uploads/${filename as string}`);
    } catch(error) {
      console.log(error);
    }
  }
  next();
}; 