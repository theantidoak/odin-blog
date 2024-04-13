import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { routes } from './routes';

export interface CustomRequest extends Request {
  token?: string;
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

app.use('/api', routes.userRouter);
app.use('/api', routes.postRouter);
app.use('/api', routes.commentRouter);

// error handler
app.use(function(err: any, req: Request, res: Response, next: NextFunction) {
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});