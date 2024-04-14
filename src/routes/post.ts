import express, { Request, Response, NextFunction} from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { postController } from '../controllers/postController';
import { CustomRequest } from '../app';

export const router = express.Router();

function verifyToken(req: Request, res: Response, next: NextFunction) {
  const bearerHeader = req.headers['authorization'];
  if (bearerHeader === undefined) return res.status(401).json({ success: false, message: 'Unauthorized access' });

  const bearerToken = bearerHeader.split(' ')[1] ?? '';
  ( req as Request & { jwtToken: string } ).jwtToken = bearerToken;
  next();
}

function authenticateToken(req: CustomRequest, res: Response, next: NextFunction) {
  const jwtToken = req.jwtToken;
  if (!jwtToken) return res.status(401).json({ success: false, message: 'No jwt token provided' });

  jwt.verify(jwtToken, process.env.SECRET as Secret, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, message: 'Unauthorized access' });
    req.user = (decoded as any).user;
    next();
  });
}

router.get('/posts', verifyToken, authenticateToken, postController.getPosts);

router.get('/posts/:slug', verifyToken, authenticateToken, postController.getPostBySlug);

router.post('/posts', verifyToken, authenticateToken, postController.createPost);

router.post('/posts/:slug', verifyToken, authenticateToken, postController.deletePost);

router.put('/posts/:slug', verifyToken, authenticateToken, postController.updatePost);
