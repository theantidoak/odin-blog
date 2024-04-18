import express from 'express';
import { postController } from '../controllers/postController';
import { authenticateJWTToken, verifyJWTToken } from '../utils/auth';

export const router = express.Router();

router.get('/posts', postController.getPosts);

router.get('/posts/:slug', postController.getPostBySlug);

router.post('/posts', verifyJWTToken, authenticateJWTToken, postController.createPost);

router.delete('/posts/:slug', verifyJWTToken, authenticateJWTToken, postController.deletePost);

router.put('/posts/:slug', verifyJWTToken, authenticateJWTToken, postController.updatePost);
