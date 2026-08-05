import { Router, Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../utils/prisma";

const router = Router();

// Rate limiting and raw parser are applied in index.ts for this route

router.post("/", async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "test_webhook_secret";

    if (!signature) {
      return res.status(400).json({ error: "Missing signature" });
    }

    // req.body is a Buffer because we used express.raw()
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("[webhook] Signature mismatch");
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Parse the raw body into JSON now that it's verified
    const payload = JSON.parse(req.body.toString());
    const eventType = payload.event;
    // Usually x-razorpay-event-id is in headers for razorpay webhooks
    const eventId = (req.headers["x-razorpay-event-id"] as string) || (payload.contains?.[0] + "-" + Date.now()); 

    // 1. Idempotency Check
    const existingEvent = await prisma.paymentEvent.findUnique({
      where: { razorpayEventId: eventId },
    });

    if (existingEvent) {
      console.log(`[webhook] Event ${eventId} already processed, skipping.`);
      return res.json({ success: true, message: "Already processed" });
    }

    // Process event
    const entity = payload.payload.subscription?.entity;
    
    if (entity) {
      const subId = entity.id;
      const status = entity.status; // authenticated, active, pending, halted, cancelled, completed, expired
      const currentPeriodEnd = new Date(entity.current_end * 1000);
      const customerId = entity.customer_id;
      let mappedStatus: "ACTIVE" | "CANCELLED" | "PAST_DUE" | "EXPIRED" = "ACTIVE";

      switch (status) {
        case "active":
          mappedStatus = "ACTIVE";
          break;
        case "cancelled":
        case "completed":
        case "expired":
          mappedStatus = "EXPIRED";
          break;
        case "halted":
        case "pending":
          mappedStatus = "PAST_DUE";
          break;
        default:
          mappedStatus = "ACTIVE";
      }

      const dbSub = await prisma.subscription.findUnique({
        where: { razorpaySubId: subId },
      });

      if (dbSub) {
        await prisma.subscription.update({
          where: { razorpaySubId: subId },
          data: {
            status: mappedStatus,
            currentPeriodEnd,
            razorpayCustomerId: customerId,
          },
        });
      }
    }

    // Record the event to prevent duplicate processing
    await prisma.paymentEvent.create({
      data: {
        razorpayEventId: eventId,
        eventType: eventType,
        rawPayload: payload,
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("[webhooks/razorpay]", err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;
