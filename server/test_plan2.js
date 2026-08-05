require('dotenv').config({ path: '.env' });
const https = require('https');

const auth = Buffer.from(process.env.RAZORPAY_KEY_ID + ':' + process.env.RAZORPAY_KEY_SECRET).toString('base64');

function fetchPlan(planId) {
  return new Promise((resolve, reject) => {
    https.get('https://api.razorpay.com/v1/plans/' + planId, {
      headers: { 'Authorization': 'Basic ' + auth }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function fetchSub(subId) {
  return new Promise((resolve, reject) => {
    https.get('https://api.razorpay.com/v1/subscriptions/' + subId, {
      headers: { 'Authorization': 'Basic ' + auth }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  const plus = await fetchPlan(process.env.RAZORPAY_PLAN_ID_PLUS);
  const pro = await fetchPlan(process.env.RAZORPAY_PLAN_ID_PRO);
  console.log("PLUS Plan:", JSON.stringify(plus, null, 2));
  console.log("PRO Plan:", JSON.stringify(pro, null, 2));
}
run();
