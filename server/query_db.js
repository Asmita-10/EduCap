const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const email = process.argv[2];
  const user = await prisma.user.findUnique({ where: { email }, include: { subscription: true } });
  if(user && user.subscription) {
     console.log(`Current Tier: ${user.subscription.tier}, Status: ${user.subscription.status}, SubID: ${user.subscription.razorpaySubId}`);
  } else {
     console.log("No subscription found.");
  }
}
main();
