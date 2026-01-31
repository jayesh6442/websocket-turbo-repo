import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });

  const token = header.split(" ")[1] || "";
  try {
    const payload = verifyToken(token);
    (req as any).userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

