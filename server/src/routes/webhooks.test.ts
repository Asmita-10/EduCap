import request from "supertest";
import express from "express";
import crypto from "crypto";
import webhooksRoutes from "./webhooks";
import { prisma } from "../utils/prisma";

// Mock prisma
jest.mock("../utils/prisma", () => ({
  prisma: {
    paymentEvent: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    subscription: {
      findUnique: jest.fn(),
      update: jest.fn(),
    }
  }
}));

describe("Razorpay Webhooks", () => {
  let app: express.Express;

  beforeAll(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = "test_secret";
    app = express();
    // Replicate what index.ts does
    app.use("/api/webhooks/razorpay", express.raw({ type: "application/json" }), webhooksRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should reject missing signature", async () => {
    const res = await request(app)
      .post("/api/webhooks/razorpay")
      .send({ event: "subscription.activated" })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing signature");
  });

  it("should reject tampered/invalid signature", async () => {
    const payload = JSON.stringify({ event: "subscription.activated" });
    
    const res = await request(app)
      .post("/api/webhooks/razorpay")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("x-razorpay-signature", "invalid_signature");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid signature");
  });

  it("should accept valid signature and process new event", async () => {
    const payload = JSON.stringify({
      event: "subscription.activated",
      contains: ["subscription"],
      payload: {
        subscription: {
          entity: {
            id: "sub_123",
            status: "active",
            current_end: Math.floor(Date.now() / 1000) + 2592000,
            customer_id: "cust_123"
          }
        }
      }
    });

    const signature = crypto
      .createHmac("sha256", "test_secret")
      .update(payload)
      .digest("hex");

    // Mock DB: event does not exist, subscription exists
    (prisma.paymentEvent.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.subscription.findUnique as jest.Mock).mockResolvedValue({ id: "db_sub_1", razorpaySubId: "sub_123" });

    const res = await request(app)
      .post("/api/webhooks/razorpay")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("x-razorpay-signature", signature)
      .set("x-razorpay-event-id", "event_123");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify DB calls
    expect(prisma.paymentEvent.findUnique).toHaveBeenCalledWith({ where: { razorpayEventId: "event_123" } });
    expect(prisma.subscription.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { razorpaySubId: "sub_123" },
      data: expect.objectContaining({ status: "ACTIVE" })
    }));
    expect(prisma.paymentEvent.create).toHaveBeenCalled();
  });

  it("should skip processing for duplicate event ID (idempotency)", async () => {
    const payload = JSON.stringify({
      event: "subscription.activated",
    });

    const signature = crypto
      .createHmac("sha256", "test_secret")
      .update(payload)
      .digest("hex");

    // Mock DB: event DOES exist
    (prisma.paymentEvent.findUnique as jest.Mock).mockResolvedValue({ id: "existing_event" });

    const res = await request(app)
      .post("/api/webhooks/razorpay")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("x-razorpay-signature", signature)
      .set("x-razorpay-event-id", "event_123");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Already processed");

    // Verify it didn't update subscription or create event
    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(prisma.paymentEvent.create).not.toHaveBeenCalled();
  });
});
