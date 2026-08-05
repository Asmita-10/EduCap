# Razorpay Test Mode Setup for EduCap

To make the subscription billing system work locally in test mode, you need to configure your Razorpay test credentials. No real money will be charged.

## 1. Create a Razorpay Account
1. Go to [Razorpay](https://razorpay.com/) and sign up.
2. Once logged in, ensure you are in **Test Mode** (toggle is usually at the top of the dashboard).

## 2. Generate API Keys
1. In the Razorpay Dashboard, navigate to **Account & Settings** -> **API Keys**.
2. Click **Generate Key** (or Regenerate).
3. Copy the `Key Id` and `Key Secret`.
4. Open `server/.env` and add/update these values:
   ```env
   RAZORPAY_KEY_ID="rzp_test_your_key_id_here"
   RAZORPAY_KEY_SECRET="your_key_secret_here"
   ```

## 3. Create Subscription Plans
You need two plans in Razorpay for Plus and Pro tiers.
1. Navigate to **Subscriptions** -> **Plans** in the Razorpay Dashboard.
2. Click **Create Plan**.
3. Create **Plus Plan**:
   - Plan Name: `EduCap Plus`
   - Billing Frequency: `Monthly`
   - Pricing: `99` (INR)
4. Create **Pro Plan**:
   - Plan Name: `EduCap Pro`
   - Billing Frequency: `Monthly`
   - Pricing: `199` (INR)
5. Copy the generated **Plan IDs** (they start with `plan_...`).
6. Update your `server/.env`:
   ```env
   RAZORPAY_PLAN_ID_PLUS="plan_your_plus_plan_id"
   RAZORPAY_PLAN_ID_PRO="plan_your_pro_plan_id"
   ```

## 4. Configure Webhooks
Webhooks are essential to know when a payment succeeds or fails automatically.
1. Navigate to **Account & Settings** -> **Webhooks**.
2. Click **Add New Webhook**.
3. For local development, you need to expose your `localhost:3001` to the internet. You can use a tool like [ngrok](https://ngrok.com/):
   ```bash
   ngrok http 3001
   ```
4. Copy the `https://...` ngrok URL.
5. In Razorpay, set the Webhook URL to: `https://<your-ngrok-url>.ngrok.app/api/webhooks/razorpay`
6. Enter a secret (e.g., `educap_secret_123`).
7. Check the following events:
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.cancelled`
   - `subscription.halted`
8. Save the webhook and add the secret to your `server/.env`:
   ```env
   RAZORPAY_WEBHOOK_SECRET="educap_secret_123"
   ```

## 5. Restart Backend
Once you have added all environment variables, restart your backend server so it picks up the real test keys.
