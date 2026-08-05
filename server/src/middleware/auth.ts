import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";

export interface AuthRequest extends Request {
  userId?: string;
  subscription?: { tier: "FREE" | "PLUS" | "PRO"; status: "ACTIVE" | "CANCELLED" | "PAST_DUE" | "EXPIRED" };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(403).json({ error: "Invalid or expired token" });
  }
}

export function requireTier(minTier: "PLUS" | "PRO") {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const sub = await prisma.subscription.findUnique({
        where: { userId: req.userId },
        select: { tier: true, status: true },
      });

      const currentTier = sub?.status === "ACTIVE" ? sub.tier : "FREE";
      
      const tiers = ["FREE", "PLUS", "PRO"];
      const currentIdx = tiers.indexOf(currentTier);
      const minIdx = tiers.indexOf(minTier);

      if (currentIdx < minIdx) {
        res.status(403).json({
          error: "Subscription upgrade required",
          code: "UPGRADE_REQUIRED",
          requiredTier: minTier,
          currentTier: currentTier,
          upgradeUrl: "/pricing",
        });
        return;
      }

      req.subscription = sub ? { tier: sub.tier, status: sub.status } : { tier: "FREE", status: "EXPIRED" };
      next();
    } catch (err) {
      console.error("[middleware/requireTier]", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
