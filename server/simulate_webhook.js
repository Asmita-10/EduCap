const crypto = require("crypto");
const http = require("http");

const payload = {
  event: "subscription.activated",
  payload: {
    subscription: {
      entity: {
        id: "sub_TLYNuJsi4vvswu",
        status: "active",
        customer_id: "cust_test_123",
        current_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      }
    }
  }
};
const payloadString = JSON.stringify(payload);
const secret = "test_webhook_secret"; // from process.env or fallback in code
const signature = crypto.createHmac("sha256", secret).update(payloadString).digest("hex");

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/webhooks/razorpay',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-razorpay-signature': signature,
    'x-razorpay-event-id': 'evt_test_' + Date.now()
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Webhook response:', res.statusCode, data));
});
req.on('error', (e) => console.error('Error:', e));
req.write(payloadString);
req.end();
