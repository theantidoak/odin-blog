import { Request, Response, NextFunction} from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { CustomRequest } from '../app';
import { User } from '../models/user';

export function verifyJWTToken(req: Request, res: Response, next: NextFunction) {
  const requestBearerToken = req.headers['authorization'] as string;
  const jwtToken = requestBearerToken ? requestBearerToken.split(' ')[1] as string : null;

  if (!jwtToken) {
    res.status(401).json({ success: false, message: 'Unauthorized access' });
  } else {
    ( req as Request & { jwtToken: string } ).jwtToken = jwtToken;
    next();
  }
}

export function authenticateJWTToken(req: CustomRequest, res: Response, next: NextFunction) {
  const jwtToken = req.jwtToken;
  if (!jwtToken) return res.status(401).json({ success: false, message: 'No jwt token provided' });

  jwt.verify(jwtToken, process.env.SECRET as Secret, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, message: 'Unauthorized access' });
    req.user = (decoded as any).user;
    next();
  });
}

export async function isAdmin(req: CustomRequest, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user || !user.id) {
    res.status(200).json({
      id: req.body.id,
      title: req.body.title, 
      content: req.body.content,
      errors: [{
        type: 'field',
        value: req.body.text,
        msg: 'Failed to submit. User is unauthorized.',
        path: 'text',
        location: 'body'
      }],
    });

    return;
  }


  const userData = await User.findById(user.id);
  const isAdmin = userData?.is_admin;

  if (!isAdmin) {
    res.status(200).json({
      id: req.body.id,
      title: req.body.title, 
      content: req.body.content,
      errors: [{
        type: 'field',
        value: req.body.text,
        msg: 'Failed to submit. You must be an admin to update a post.',
        path: 'text',
        location: 'body'
      }],
    });

    return;
  }

  next();
}