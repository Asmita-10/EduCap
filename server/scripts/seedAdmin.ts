import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@gmail.com";
  const password = "password";
  
  const existingAdmin = await prisma.admin.findUnique({ where: { email } });
  
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.admin.create({
      data: {
        email,
        passwordHash,
        name: "Super Admin",
      },
    });
    console.log("Admin seeded successfully: admin@gmail.com / password");
  } else {
    console.log("Admin already exists!");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
