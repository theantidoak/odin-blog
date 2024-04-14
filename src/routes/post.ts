import express, { Request, Response, NextFunction} from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { postController } from '../controllers/postController';
import { CustomRequest } from '../app';

export const router = express.Router();

function verifyJWTToken(req: Request, res: Response, next: NextFunction) {
  const bearerToken = req.cookies.ob_secure_auth;
  if (bearerToken === undefined) {
    res.status(401).json({ success: false, message: 'Unauthorized access' });
  } else {
    ( req as Request & { jwtToken: string } ).jwtToken = bearerToken;
    next();
  }
}

function authenticateJWTToken(req: CustomRequest, res: Response, next: NextFunction) {
  const jwtToken = req.jwtToken;
  if (!jwtToken) return res.status(401).json({ success: false, message: 'No jwt token provided' });

  jwt.verify(jwtToken, process.env.SECRET as Secret, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, message: 'Unauthorized access' });
    req.user = (decoded as any).user;
    next();
  });
}

router.get('/posts', verifyJWTToken, authenticateJWTToken, postController.getPosts);

router.get('/posts/:slug', verifyJWTToken, authenticateJWTToken, postController.getPostBySlug);

router.post('/posts', verifyJWTToken, authenticateJWTToken, postController.createPost);

router.post('/posts/:slug', verifyJWTToken, authenticateJWTToken, postController.deletePost);

router.put('/posts/:slug', verifyJWTToken, authenticateJWTToken, postController.updatePost);
