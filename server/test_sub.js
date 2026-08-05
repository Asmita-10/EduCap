require('dotenv').config();
const Razorpay = require('razorpay');

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "test_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "test_secret",
});

async function run() {
  try {
    const planId = process.env.RAZORPAY_PLAN_ID_PLUS;
    const subscription = await rzp.subscriptions.create({
      plan_id: planId,
      total_count: 120,
      customer_notify: 1,
    });
    console.log("Subscription created:", JSON.stringify(subscription, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
