import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
  id: string;
}

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthRequest extends Request {
  user?: { id: string};
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies.token;
  if(!token){
    res.status(401).json({error:"Unauthorized"});
    return
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    req.user = { id: decoded.id};
    next();
  
  } catch (err) {
    res.status(401).json({ error: "invalid token" });
  }
}

