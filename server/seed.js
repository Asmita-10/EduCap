/**
 * seed.js — One-time database seed for User + Admin accounts.
 * Uses the same bcryptjs library as the auth routes for hash compatibility.
 *
 * Usage:  node seed.js
 * Requires DATABASE_URL to be set (reads from .env via Prisma).
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── 1. Seed Student User ────────────────────────────────
  const studentHash = await bcrypt.hash("test123", 10);
  const student = await prisma.user.upsert({
    where: { email: "test@gmail.com" },
    update: {
      passwordHash: studentHash,
      name: "Test Student",
    },
    create: {
      email: "test@gmail.com",
      passwordHash: studentHash,
      name: "Test Student",
    },
  });
  console.log(`✅ Student seeded: ${student.email}  (id: ${student.id})`);

  // ── 2. Seed Admin User ──────────────────────────────────
  // Both "password" and "password123" support:
  // Using "password" as default admin password to match AdminLoginPage UI default
  const adminHash = await bcrypt.hash("password", 10);
  const admin = await prisma.admin.upsert({
    where: { email: "admin@gmail.com" },
    update: {
      passwordHash: adminHash,
      name: "Admin User",
    },
    create: {
      email: "admin@gmail.com",
      passwordHash: adminHash,
      name: "Admin User",
    },
  });
  console.log(`✅ Admin  seeded: ${admin.email}  (id: ${admin.id})`);

  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
