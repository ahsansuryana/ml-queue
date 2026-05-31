import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AuthRequest } from "../types";

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    _res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      streamerId: string;
    };
    (req as AuthRequest).streamerId = payload.streamerId;
    next();
  } catch {
    _res.status(401).json({ error: "Invalid token" });
  }
}
