import express from 'express';
import { commentController } from '../controllers/commentController';

export const router = express.Router();

router.get('/comments', commentController.getComments);

router.post('/comments', commentController.createComment);

router.post('/comments/:id', commentController.deleteComment);

router.put('/comments/:id', commentController.updateComment);
