#!/bin/bash
set -e

# Register a new user
EMAIL="switchtest_$RANDOM@educap.test"
echo "Registering user $EMAIL..."
LOGIN_RES=$(curl -s -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\",\"password\":\"TestPass123!\"}")
ACCESS_TOKEN=$(echo $LOGIN_RES | jq -r .accessToken)

echo "--- 1. Subscribe to PLUS ---"
SUB_PLUS_RES=$(curl -s -X POST http://localhost:3001/api/subscriptions/create-order -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" -d '{"tier":"PLUS"}')
PLUS_SUB_ID=$(echo $SUB_PLUS_RES | jq -r .subscription_id)
curl -s -X POST http://localhost:3001/api/subscriptions/confirm-payment -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" -d "{\"razorpay_payment_id\": \"pay_fake1\", \"razorpay_subscription_id\": \"$PLUS_SUB_ID\", \"razorpay_signature\": \"mock_signature_educap_test_123\", \"tier\": \"PLUS\"}" | jq -c .

echo "Checking DB state:"
node query_db.js $EMAIL

echo "--- 2. Switch from PLUS to PRO (Upgrade) ---"
SWITCH_PRO_RES=$(curl -s -X POST http://localhost:3001/api/subscriptions/switch -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" -d '{"tier":"PRO"}')
PRO_SUB_ID=$(echo $SWITCH_PRO_RES | jq -r .subscription_id)
curl -s -X POST http://localhost:3001/api/subscriptions/confirm-payment -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" -d "{\"razorpay_payment_id\": \"pay_fake2\", \"razorpay_subscription_id\": \"$PRO_SUB_ID\", \"razorpay_signature\": \"mock_signature_educap_test_123\", \"tier\": \"PRO\"}" | jq -c .

echo "Checking DB state:"
node query_db.js $EMAIL

echo "--- 3. Switch from PRO to PLUS (Downgrade) ---"
SWITCH_PLUS2_RES=$(curl -s -X POST http://localhost:3001/api/subscriptions/switch -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" -d '{"tier":"PLUS"}')
PLUS2_SUB_ID=$(echo $SWITCH_PLUS2_RES | jq -r .subscription_id)
curl -s -X POST http://localhost:3001/api/subscriptions/confirm-payment -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" -d "{\"razorpay_payment_id\": \"pay_fake3\", \"razorpay_subscription_id\": \"$PLUS2_SUB_ID\", \"razorpay_signature\": \"mock_signature_educap_test_123\", \"tier\": \"PLUS\"}" | jq -c .

echo "Checking DB state:"
node query_db.js $EMAIL

echo "--- 4. Downgrade to FREE (Immediate Cancel) ---"
curl -s -X POST http://localhost:3001/api/subscriptions/cancel -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" -d '{"immediate":true}' | jq -c .

echo "Checking DB state:"
node query_db.js $EMAIL

