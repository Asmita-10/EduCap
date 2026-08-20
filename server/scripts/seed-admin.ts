import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Connecting to Database:", process.env.DATABASE_URL?.replace(/:[^:]*@/, ":****@"));
  
  const email = "admin@gmail.com";
  const plainPassword = "password";

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email }
  });

  if (existingAdmin) {
    console.log(`Admin ${email} already exists! Overwriting password...`);
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const updated = await prisma.admin.update({
      where: { email },
      data: { passwordHash }
    });
    console.log(`Admin password updated successfully. ID: ${updated.id}`);
  } else {
    console.log(`Creating new admin: ${email}...`);
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const created = await prisma.admin.create({
      data: {
        email,
        passwordHash,
        name: "Admin",
      }
    });
    console.log(`Admin created successfully. ID: ${created.id}`);
  }

  // Verify by querying it back
  const verify = await prisma.admin.findUnique({
    where: { email }
  });

  if (verify) {
    console.log("✅ Verification successful! Admin record found in database.");
  } else {
    console.log("❌ Verification failed! Could not retrieve admin record.");
  }
}

main()
  .catch((e) => {
    console.error("Error creating admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
