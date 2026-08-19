const Razorpay = require('razorpay');
require('dotenv').config({ path: 'server/.env' });

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret'
});

async function test() {
  try {
    const sub = await rzp.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID_PLUS,
      total_count: 120,
      customer_notify: 1
    });
    console.log("Subscription created:", sub.id);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
