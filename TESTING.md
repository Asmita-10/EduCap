# Testing the Custom Checkout Flow

This document explains how to test the Razorpay Custom Checkout implementation in EduCap.

## Why is there an OTP popup?
In India, the RBI mandates Additional Factor of Authentication (AFA) for all online card transactions. Razorpay enforces this even in Custom Checkout. Our custom integration completely hides the Razorpay initial "choose payment method" screen and the "enter phone/email" screen, but it **must** display the small bank-side 3D Secure / OTP simulation popup. This cannot be bypassed in test or live mode for cards.

## Test Card Flow
1. Ensure the backend and frontend are running (`npm run dev`).
2. Log into the EduCap dashboard.
3. Click **Subscribe to Plus** (or Pro).
4. The EduCap custom checkout modal will appear.
5. In the **Credit / Debit Card** tab, enter the following details:
   - **Card Number**: `4111 1111 1111 1111`
   - **Expiry**: `12/28` (or any future date)
   - **CVV**: `123` (or any 3 digits)
   - **Name**: `Test User`
6. Click **Pay ₹100**.
7. The small Razorpay test authentication popup will appear (simulating the bank ACS page).
8. Enter any 6-digit OTP (e.g., `123456`) and click **Submit**.
9. The modal will close, the backend will verify the signature, create the subscription, and your dashboard will update.

## Test UPI Flow (Faster, No OTP)
If you want to test the flow without the OTP simulation:
1. Open the EduCap custom checkout modal.
2. Switch to the **UPI** tab.
3. Enter the VPA: `success@razorpay`
4. Click **Pay ₹100**.
5. The payment will instantly succeed without any OTP popup, and your dashboard will update.
