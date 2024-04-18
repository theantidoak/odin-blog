import express from 'express';
import { userController } from '../controllers/userController';
import { authenticateJWTToken, verifyJWTToken } from '../utils/auth';

export const router = express.Router();

router.post("/logout", verifyJWTToken, authenticateJWTToken, userController.logout);

router.post('/login', userController.login);

router.get('/auth', verifyJWTToken, authenticateJWTToken, userController.auth);