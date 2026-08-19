// Server entry point with in‑memory MongoDB for development
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

dotenv.config();

// import authRoutes from "./routes/auth";
// import plansRoutes from "./routes/plans";
// import calculateRoutes from "./routes/calculate";
// import exportRoutes from "./routes/export";
// import subscriptionsRoutes from "./routes/subscriptions";
// import webhooksRoutes from "./routes/webhooks";
// import adminRoutes from "./routes/admin";

const app = express();

// Middleware
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Webhooks raw parsing
const webhookLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
// app.use("/api/webhooks/razorpay", webhookLimiter, express.raw({ type: "application/json" }), webhooksRoutes);

// JSON body parsing
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

// Development mode: start in‑memory MongoDB and seed data
async function startServer() {
  /*
  if (process.env.NODE_ENV !== "production") {
    // const { MongoMemoryReplSet } = await import("mongodb-memory-server");
    // const replSet = await MongoMemoryReplSet.create({ replSet: { storageEngine: "wiredTiger" } });
    // const uri = replSet.getUri();
    // const dbName = "educap";
    // const finalUri = uri.includes("?") ? uri.replace("/?", `/${dbName}?`) : (uri.endsWith("/") ? `${uri}${dbName}` : `${uri}/${dbName}`);
    // process.env.DATABASE_URL = finalUri;
    // console.log("🗄️ In‑memory MongoDB URI for Prisma:", finalUri);
    //
    // const { execSync } = await import("child_process");
    // execSync("npx prisma db push", { stdio: "inherit" });
    //
    // const { PrismaClient } = await import("@prisma/client");
    // global.__prisma = new PrismaClient({ log: ["warn", "error"] });
    //
    // const { prisma } = await import("./utils/prisma");
    // const bcrypt = await import("bcrypt");
    // const adminHash = await bcrypt.default.hash("password", 10);
    // await prisma.admin.create({ data: { email: "admin@gmail.com", passwordHash: adminHash, name: "Admin" } }).catch(() => {});
    // const studentHash = await bcrypt.default.hash("password123", 10);
    // await prisma.user.create({ data: { email: "test@example.com", passwordHash: studentHash, name: "Test Student" } }).catch(() => {});
  }
  */

  // Register API routes (after DB is ready)
  const { default: authRoutes } = await import("./routes/auth");
  const { default: subscriptionsRoutes } = await import("./routes/subscriptions");
  const { default: plansRoutes } = await import("./routes/plans");
  const { default: calculateRoutes } = await import("./routes/calculate");
  const { default: exportRoutes } = await import("./routes/export");
  const { default: adminRoutes } = await import("./routes/admin");
  app.use("/api/auth", authRoutes);
  app.use("/api/subscriptions", subscriptionsRoutes);
  app.use("/api/plans", plansRoutes);
  app.use("/api/calculate", calculateRoutes);
  app.use("/api/plans", exportRoutes); // /api/plans/:id/export
  app.use("/api/admin", adminRoutes);

  // 404 handler
  app.use((_req, res: express.Response) => {
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
}

startServer();

export default app;
