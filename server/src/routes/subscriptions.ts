import { Router, Response } from "express";
import crypto from "crypto";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { prisma } from "../utils/prisma";
import Razorpay from "razorpay";
import rateLimit from "express-rate-limit";
import { z } from "zod";

const router = Router();

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "test_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "test_secret",
});

const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many subscription requests" },
});

const CreateSubSchema = z.object({
  tier: z.enum(["PLUS", "PRO"]),
});

router.post("/create-order", authenticateToken, createLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { tier } = CreateSubSchema.parse(req.body);

    const planId = tier === "PLUS" 
      ? process.env.RAZORPAY_PLAN_ID_PLUS 
      : process.env.RAZORPAY_PLAN_ID_PRO;

    if (!planId) {
      return res.status(500).json({ error: "Razorpay Plan ID not configured" });
    }

    const subscription = await rzp.subscriptions.create({
      plan_id: planId,
      total_count: 120,
      customer_notify: 1,
    });

    // Fetch the plan to get the EXACT amount expected by Razorpay
    const plan = await rzp.plans.fetch(planId);

    res.json({ 
      subscription_id: subscription.id,
      amount: plan.item.amount,
      key_id: process.env.RAZORPAY_KEY_ID || "test_key",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues[0].message });
    }
    console.error("[subscriptions/create-order]", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

const ConfirmSchema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_subscription_id: z.string(),
  razorpay_signature: z.string(),
  tier: z.enum(["PLUS", "PRO"]),
});

router.post("/confirm-payment", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const data = ConfirmSchema.parse(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "test_secret")
      .update(data.razorpay_payment_id + "|" + data.razorpay_subscription_id)
      .digest("hex");

    if (expectedSignature !== data.razorpay_signature) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Upsert subscription as ACTIVE
    await prisma.subscription.upsert({
      where: { userId: req.userId! },
      update: { razorpaySubId: data.razorpay_subscription_id, tier: data.tier, status: "ACTIVE", currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      create: { userId: req.userId!, razorpaySubId: data.razorpay_subscription_id, tier: data.tier, status: "ACTIVE", currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("[subscriptions/confirm-payment]", err);
    res.status(400).json({ error: "Payment verification failed" });
  }
});

router.get("/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const sub = await prisma.subscription.findUnique({
      where: { userId: req.userId! },
      select: { tier: true, status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true },
    });

    if (!sub) {
      return res.json({ tier: "FREE", status: "EXPIRED" });
    }

    // If past due or expired based on date but status is still active, just reflect status
    res.json(sub);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
});

router.post("/cancel", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const sub = await prisma.subscription.findUnique({
      where: { userId: req.userId! },
    });

    if (!sub || sub.status !== "ACTIVE") {
      return res.status(400).json({ error: "No active subscription to cancel" });
    }

    await rzp.subscriptions.cancel(sub.razorpaySubId, false); // false = cancel at period end

    // Optimistically update
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { cancelAtPeriodEnd: true },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("[subscriptions/cancel]", err);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

export default router;
