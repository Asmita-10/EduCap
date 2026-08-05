import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();

import authRoutes from "./routes/auth";
import plansRoutes from "./routes/plans";
import calculateRoutes from "./routes/calculate";
import exportRoutes from "./routes/export";
import subscriptionsRoutes from "./routes/subscriptions";
import webhooksRoutes from "./routes/webhooks";

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true,
}));

// Webhooks must be parsed as raw buffer for signature verification
const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // higher limit for webhooks
});
app.use("/api/webhooks/razorpay", webhookLimiter, express.raw({ type: "application/json" }), webhooksRoutes);

// Regular JSON parsing for other routes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);
app.use("/api/plans", plansRoutes);
app.use("/api/calculate", calculateRoutes);
app.use("/api/plans", exportRoutes); // /api/plans/:id/export

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[server error]", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 EduCap server running on http://localhost:${PORT}`);
});

export default app;
setInterval(() => {}, 1000);
