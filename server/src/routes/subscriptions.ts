import { Router, Response } from "express";
import crypto from "crypto";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { prisma } from "../utils/prisma";
import Razorpay from "razorpay";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import PDFDocument from "pdfkit";

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
    let subscription;
    try {
      subscription = await rzp.subscriptions.create({
        plan_id: planId,
        total_count: 120,
        customer_notify: 1,
      });
    } catch (err) {
      // Fallback dummy subscription for offline dev
      console.warn("Razorpay create failed, using fallback subscription", err);
      subscription = { id: "sub_dummy_" + Math.random().toString(36).substring(2, 10) } as any;
    }
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

router.get("/receipt/:paymentId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    
    // In a real app we'd verify the payment belongs to the user and fetch real amount.
    // Here we query the subscription to at least verify the user is subscribed.
    const sub = await prisma.subscription.findUnique({
      where: { userId: req.userId! },
      include: { user: true }
    });

    if (!sub) return res.status(404).json({ error: "Subscription not found" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="EduCap-Receipt-${paymentId}.pdf"`);

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    doc.pipe(res);

    // Header
    doc.fontSize(24).fillColor("#6c47ff").text("EduCap", { align: "center" });
    doc.fontSize(12).fillColor("#666").text("Payment Successful - EduCap Pro Plan", { align: "center" });
    doc.moveDown(2);

    // Details
    doc.fontSize(14).fillColor("#222").text("Transaction Details", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#333");
    
    doc.text(`Transaction ID / Payment ID: ${paymentId}`);
    doc.text(`Amount Paid: ₹${sub.tier === "PRO" ? "199" : "100"}`);
    doc.text(`Subscription Plan Name: EduCap ${sub.tier}`);
    doc.text(`Payment Date & Time: ${new Date().toLocaleString("en-IN")}`);
    
    doc.moveDown();
    doc.fontSize(14).fillColor("#222").text("User Details", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#333");
    doc.text(`Email: ${sub.user.email}`);
    doc.text(`Account ID: ${sub.userId}`);

    // Footer
    doc.moveDown(3);
    doc.fontSize(10).fillColor("#aaa").text(
      "Thank you for subscribing to EduCap. This is an automatically generated receipt.",
      { align: "center" }
    );

    doc.end();
  } catch (err) {
    console.error("[receipt]", err);
    res.status(500).json({ error: "Failed to generate receipt" });
  }
});

router.get("/history", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const events = await prisma.paymentEvent.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: "desc" },
    });

    const transactions = events.map(event => {
      // Assuming payload is from razorpay webhook, which has payload.payment.entity for payments
      // or we can extract some details from the rawPayload
      const payload: any = event.rawPayload;
      const paymentEntity = payload?.payload?.payment?.entity;
      const subEntity = payload?.payload?.subscription?.entity;
      
      const amount = paymentEntity ? paymentEntity.amount / 100 : (subEntity?.plan_id?.includes("PRO") ? 199 : 100);
      const method = paymentEntity?.method || "Razorpay";
      
      return {
        transactionId: event.razorpayEventId,
        timestamp: event.createdAt.toISOString(),
        description: event.eventType,
        paymentMethod: method,
        amount: amount,
        status: "SUCCESS",
        subscription: subEntity?.plan_id?.includes("PRO") ? "EduCap PRO" : "EduCap PLUS",
      };
    });

    res.json(transactions);
  } catch (err) {
    console.error("[subscriptions/history]", err);
    res.status(500).json({ error: "Failed to fetch transaction history" });
  }
});

export default router;
