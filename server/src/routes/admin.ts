import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";
import { authenticateAdminToken, AdminAuthRequest } from "../middleware/adminAuth";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_educap_2024";

// ========================
// AUTHENTICATION
// ========================

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: admin.id, role: "admin" }, JWT_SECRET, { expiresIn: "24h" });

    // Store in httpOnly cookie
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24h
      sameSite: "lax",
    });

    res.json({ success: true, admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (err) { console.error('Login error:', err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("admin_token");
  res.json({ success: true });
});

router.get("/me", authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const admin = await prisma.admin.findUnique({ where: { id: req.adminId } });
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    res.json({ id: admin.id, email: admin.email, name: admin.name });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ========================
// USERS
// ========================

router.get("/users", authenticateAdminToken, async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10", search = "", plan = "", status = "" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: "insensitive" } },
        { name: { contains: search as string, mode: "insensitive" } }
      ];
    }
    
    // For plan & status filtering, since it's on a relation, we filter via the subscription
    if (plan || status) {
      where.subscription = {};
      if (plan && plan !== 'FREE') {
        where.subscription.tier = plan;
      }
      if (status) {
        where.subscription.status = status;
      }
      
      // If filtering by FREE plan, they might not have a subscription record, 
      // or their subscription might be inactive.
      if (plan === 'FREE') {
         where.subscription = { is: null }; // basic logic for free tier
      }
    }

    const total = await prisma.user.count({ where });
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      include: { subscription: true }
    });

    res.json({
      users,
      total,
      pages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/users/:id", authenticateAdminToken, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      include: { subscription: true }
    });
    
    if (!user) return res.status(404).json({ error: "User not found" });
    
    const payments = await (prisma as any).payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });
    
    const totalSpent = payments.reduce((sum: number, p: any) => sum + p.amount, 0);

    res.json({ user, payments, totalSpent });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/users/:id", authenticateAdminToken, async (req: Request, res: Response) => {
  try {
    const { name, email, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: { name, email, phone }
    });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/users/:id", authenticateAdminToken, async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ========================
// SUBSCRIPTIONS
// ========================

router.get("/subscriptions", authenticateAdminToken, async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10", search = "", plan = "", status = "" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (plan) where.tier = plan;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { razorpaySubId: { contains: search as string, mode: "insensitive" } },
        { user: { email: { contains: search as string, mode: "insensitive" } } }
      ];
    }

    const total = await prisma.subscription.count({ where });
    const subscriptions = await prisma.subscription.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      include: { user: true }
    });

    res.json({
      subscriptions,
      total,
      pages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/subscriptions/:id", authenticateAdminToken, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { user: true }
    });
    if (!subscription) return res.status(404).json({ error: "Not found" });
    const paymentHistory = await (prisma as any).payment.findMany({
      where: { subscriptionId: id },
      orderBy: { createdAt: "desc" }
    });
    res.json({ subscription, paymentHistory });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/subscriptions/:id/pause", authenticateAdminToken, async (req: Request, res: Response) => {
  try {
    const subscription = await prisma.subscription.update({
      where: { id: req.params.id as string },
      data: { status: "PAST_DUE" }
    });
    res.json({ subscription });
  } catch (err) {
    res.status(500).json({ error: "Failed to pause" });
  }
});

router.put("/subscriptions/:id/cancel", authenticateAdminToken, async (req: Request, res: Response) => {
  try {
    const subscription = await prisma.subscription.update({
      where: { id: req.params.id as string },
      data: { status: "CANCELLED" }
    });
    res.json({ subscription });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel" });
  }
});

router.post("/subscriptions/:id/refund", authenticateAdminToken, async (req: Request, res: Response) => {
  try {
    // Simulated refund
    res.json({ refund: true, message: "Refund simulated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to refund" });
  }
});

// ========================
// ANALYTICS
// ========================

router.get("/analytics/overview", authenticateAdminToken, async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const activeSubscriptionsCount = await prisma.subscription.count({
      where: { status: "ACTIVE" }
    });
    
    // Free Tier Users = totalUsers - activeSubscriptionsCount (approximate)
    const freeTierUsers = totalUsers - activeSubscriptionsCount;
    
    // MRR Calculation
    const activeSubs = await prisma.subscription.findMany({
      where: { status: "ACTIVE" }
    });
    const mrr = activeSubs.reduce((sum, sub) => sum + (sub.tier === "PRO" ? 199 : 100), 0);
    
    res.json({ totalUsers, activeSubscriptions: activeSubscriptionsCount, mrr, freeTierUsers });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/analytics/user-growth", authenticateAdminToken, async (req: Request, res: Response) => {
  try {
    // Grouping by month manually since MongoDB aggregation in Prisma is a bit complex
    const users = await prisma.user.findMany({ select: { createdAt: true } });
    
    const monthlyData: Record<string, number> = {};
    users.forEach(u => {
      const month = `${u.createdAt.getFullYear()}-${String(u.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    const formattedData = Object.keys(monthlyData).sort().map(key => ({
      month: key,
      users: monthlyData[key]
    }));

    // Accumulate for growth chart
    let cumulative = 0;
    const growthData = formattedData.map(item => {
      cumulative += item.users;
      return { month: item.month, users: cumulative };
    });

    res.json({ monthlyData: growthData });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/analytics/subscriptions", authenticateAdminToken, async (req: Request, res: Response) => {
  try {
    const plus = await prisma.subscription.count({ where: { tier: "PLUS", status: "ACTIVE" } });
    const pro = await prisma.subscription.count({ where: { tier: "PRO", status: "ACTIVE" } });
    const totalUsers = await prisma.user.count();
    const free = Math.max(0, totalUsers - (plus + pro));
    
    res.json({
      distribution: [
        { name: "Free", value: free },
        { name: "Plus", value: plus },
        { name: "Pro", value: pro }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/analytics/revenue", authenticateAdminToken, async (req: Request, res: Response) => {
  try {
    const payments = await (prisma as any).payment.findMany({ where: { status: "Success" } });
    
    const monthlyRevenue: Record<string, number> = {};
    payments.forEach((p: any) => {
      const month = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + p.amount;
    });

    const formattedData = Object.keys(monthlyRevenue).sort().map(key => ({
      month: key,
      revenue: monthlyRevenue[key]
    }));

    res.json({ monthlyRevenue: formattedData });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
