import express from 'express';
import { userController } from '../controllers/userController';

export const router = express.Router();

router.post("/logout", userController.logout);

router.post('/login', userController.login);