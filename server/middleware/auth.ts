import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d";

export interface AuthRequest extends Request {
  user?: any;
}

export function generateToken(user: { id: string; username: string; role?: string }) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role || "user" },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export async function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"] as string | undefined;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    // attach basic user info to request
    req.user = { id: decoded.id, username: decoded.username, role: decoded.role };
    next();
  } catch (err: any) {
    console.error("JWT verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export async function verifyAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"] as string | undefined;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    req.user = { id: decoded.id, username: decoded.username, role: decoded.role };
    next();
  } catch (err: any) {
    console.error("Admin verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
