import { Request, Response, NextFunction} from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { CustomRequest } from '../app';

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