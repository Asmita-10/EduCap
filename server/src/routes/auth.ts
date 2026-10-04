import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../utils/prisma";

const router = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const LoginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
  role: z.string().optional().default("STUDENT"),
});

function generateTokens(userId: string) {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
}

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password } = RegisterSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email: normalizedEmail, passwordHash },
    });

    const { accessToken, refreshToken } = generateTokens(user.id);
    const isProd = process.env.NODE_ENV === "production";
    // Set httpOnly cookies for auth tokens
    res.cookie('access_token', accessToken, { httpOnly: true, sameSite: isProd ? 'none' : 'lax', secure: isProd, path: '/' });
    res.cookie('refresh_token', refreshToken, { httpOnly: true, sameSite: isProd ? 'none' : 'lax', secure: isProd, path: '/' });
    return res.status(201).json({
      user: { id: user.id, email: user.email, tier: "FREE" },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues[0].message });
    }
    console.error("[auth/register]", err);
    return res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password, role = "STUDENT" } = LoginSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase().trim();

    if (role.toUpperCase() === "ADMIN") {
      // Guard: if this email belongs to a Student account, reject immediately.
      // Students must use the Student toggle — they cannot log in as Admin.
      const studentWithSameEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (studentWithSameEmail) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const admin = await prisma.admin.findUnique({ where: { email: normalizedEmail } });
      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, admin.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: admin.id, role: "admin" },
        process.env.JWT_SECRET || "fallback_secret_educap_2024",
        { expiresIn: "24h" }
      );

      const isProd = process.env.NODE_ENV === "production";
      res.cookie("admin_token", token, {
        httpOnly: true,
        secure: isProd,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: isProd ? "none" : "lax",
        path: "/",
      });
      res.cookie("access_token", token, {
        httpOnly: true,
        secure: isProd,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: isProd ? "none" : "lax",
        path: "/",
      });

      return res.json({
        success: true,
        admin: { id: admin.id, email: admin.email, name: admin.name },
        user: { id: admin.id, email: admin.email, role: "ADMIN", name: admin.name },
        accessToken: token,
      });
    }

    if (role.toUpperCase() === "STUDENT") {
      // Guard: if this email belongs to an Admin account, reject immediately.
      // Admins must use the Admin toggle — they cannot log in as Students.
      const adminWithSameEmail = await prisma.admin.findUnique({ where: { email: normalizedEmail } });
      if (adminWithSameEmail) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const sub = await prisma.subscription.findUnique({
        where: { userId: user.id },
      });
      const tier = sub?.status === "ACTIVE" ? sub.tier : "FREE";

      const { accessToken, refreshToken } = generateTokens(user.id);
      const isProd = process.env.NODE_ENV === "production";
      // Set httpOnly cookies for auth tokens
      res.cookie('access_token', accessToken, { httpOnly: true, sameSite: isProd ? 'none' : 'lax', secure: isProd, path: '/' });
      res.cookie('refresh_token', refreshToken, { httpOnly: true, sameSite: isProd ? 'none' : 'lax', secure: isProd, path: '/' });
      return res.json({
        user: { id: user.id, email: user.email, tier, role: "STUDENT" },
        accessToken,
        refreshToken,
      });
    }

    return res.status(400).json({ error: "Invalid role specified" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues[0].message });
    }
    console.error("[auth/login error]", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

// POST /api/auth/refresh
router.post("/refresh", (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: "Refresh token required" });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      userId: string;
    };
    const { accessToken, refreshToken: newRefresh } = generateTokens(payload.userId);
    return res.json({ accessToken, refreshToken: newRefresh });
  } catch {
    return res.status(403).json({ error: "Invalid refresh token" });
  }
});

export default router;
