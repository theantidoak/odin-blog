import express from 'express';
import { postController } from '../controllers/postController';
import { authenticateJWTToken, isAdmin, verifyJWTToken } from '../utils/auth';

export const router = express.Router();

router.get('/posts', postController.getPosts);

router.get('/posts/:slug', postController.getPostBySlug);

router.post('/posts', verifyJWTToken, authenticateJWTToken, isAdmin, postController.createPost);

router.delete('/posts/:slug', verifyJWTToken, authenticateJWTToken, isAdmin, postController.deletePost);

router.put('/posts/:slug', verifyJWTToken, authenticateJWTToken, isAdmin, postController.updatePost);
