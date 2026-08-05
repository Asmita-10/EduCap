require('dotenv').config();
const Razorpay = require('razorpay');

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "test_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "test_secret",
});

async function run() {
  try {
    const planId = process.env.RAZORPAY_PLAN_ID_PRO;
    const plan = await rzp.plans.fetch(planId);
    console.log("Plan PRO amount:", plan.item.amount);
    
    const planIdPlus = process.env.RAZORPAY_PLAN_ID_PLUS;
    const planPlus = await rzp.plans.fetch(planIdPlus);
    console.log("Plan PLUS amount:", planPlus.item.amount);
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
