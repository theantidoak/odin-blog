import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler';
import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import { User } from '../models/user';

interface UserController {
  login?: any;
  logout?: any;
  auth?: any;
}

export const userController: UserController = {};

userController.logout = asyncHandler((req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

userController.login = [
  body('email')
    .trim()
    .escape(),
  body('password')
    .trim()
    .escape(),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req);
    const user = await User.findOne({ email: req.body.email }) ?? null;
    const isAllowed = user ? await bcrypt.compare(req.body.password, user.hash) : null;

    if (!error.isEmpty() || !isAllowed || !user) {
      const errors = error.array();

      if (!isAllowed || !user) {
        errors.push({
          type: 'field',
          value: req.body.email,
          msg: 'Invalid username or password. Please try again.',
          path: 'email',
          location: 'body'
        });
      }

      res.status(400).json({
        success: false,
        title: "Login",
        user: req.body,
        errors: errors
      });

      return;
    }

    jwt.sign({ user: { id: user.id } }, process.env.SECRET as Secret, { expiresIn: '2h' }, (err, jwtToken) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error creating jwt token', err });
      }
      
      const expire = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      const cookie = { 'ob_secure_auth': jwtToken, path: '/', httpOnly: true, secure: true, sameSite: 'none', maxAge: 7200000, expires: expire };
      res.status(200).json({ success: true, message: 'Login successful', cookie });
    })
  })
];

userController.auth = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = (req as any).user;
  const user = await User.findById(id);
  res.status(200).json({ success: true, message: 'User is Authorized', user: user?.email });
};