import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_educap_2024";

export interface AdminAuthRequest extends Request {
  adminId?: string;
}

export const authenticateAdminToken = (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  // First check cookie, then Authorization header
  const token = req.cookies?.admin_token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role?: string };

    // Enforce admin role
    if (decoded.role !== 'admin') {
        return res.status(403).json({ error: "Access forbidden. Not an admin." });
    }
    req.adminId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
