import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './routes';
import * as utils from './utils';

const app = express();

// Set up views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Set up cors
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
}));

// Set up public directory
app.use(express.static(path.join(__dirname, "public")));

// Set up body-parser for accessing POST request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Make utilities available in templates/controllers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.utils = utils;
  res.locals.currentPath = req.path;
  next();
});

// Set up routes
app.use("/", routes);

app.use(utils.errorHandler);

export default app; 