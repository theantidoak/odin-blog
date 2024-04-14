import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { routes } from './routes';

export interface CustomRequest extends Request {
  jwtToken?: string;
  user?: any;
}

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));

mongoose.set("strictQuery", false);
const mongoDB = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASSWORD}@cluster0.zp8czot.mongodb.net/odin_blog?retryWrites=true&w=majority`
  || "mongodb+srv://user:password@cluster0.zp8czot.mongodb.net/odin_blog?retryWrites=true&w=majority";

async function connectDB() {
  await mongoose.connect(mongoDB);
}

connectDB().catch((err) => console.log(err));

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'hello postman'
  });
});

const allowList = ['http://localhost:3000/'];
function authorizeDomain(req: Request, res: Response, next: NextFunction) {
  const apiToken = process.env.APITOKEN as string;
  const requestBearerToken = req.headers['authorization'];
  const requestReferer = req.headers['referer'];

  const hasToken = requestBearerToken && requestBearerToken.split(' ')[1] === apiToken;
  const isAllowed = requestReferer && allowList.includes(requestReferer);

  if (hasToken || isAllowed) {
    next();
  } else {
    res.status(403).send("Access denied");
  }
}

app.use(cors());
app.use(authorizeDomain);

app.use('/api', routes.userRouter);
app.use('/api', routes.postRouter);
app.use('/api', routes.commentRouter);

// error handler
app.use(function(err: any, req: Request, res: Response, next: NextFunction) {
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});