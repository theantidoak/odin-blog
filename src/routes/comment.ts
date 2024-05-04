import express from 'express';
import { commentController } from '../controllers/commentController';
import { isAdmin } from '../utils/auth';

export const router = express.Router();

router.get('/comments/:post', commentController.getComments);

router.post('/comments', commentController.createComment);

router.delete('/comments/:id', isAdmin, commentController.deleteComment);

router.put('/comments/:id', commentController.updateComment);
