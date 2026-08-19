import requests
import json
import subprocess
import time

BASE_URL = "http://localhost:3001"
EMAIL = f"switchtest_{int(time.time())}@educap.test"

print(f"Registering user {EMAIL}...")
res = requests.post(f"{BASE_URL}/api/auth/register", json={"email": EMAIL, "password": "TestPass123!"})
res.raise_for_status()
token = res.json()["accessToken"]
headers = {"Authorization": f"Bearer {token}"}

def check_db():
    subprocess.run(["node", "query_db.js", EMAIL])

print("--- 1. Subscribe to PLUS ---")
res = requests.post(f"{BASE_URL}/api/subscriptions/create-order", json={"tier": "PLUS"}, headers=headers)
plus_sub_id = res.json()["subscription_id"]
res = requests.post(f"{BASE_URL}/api/subscriptions/confirm-payment", json={
    "razorpay_payment_id": "pay_fake1",
    "razorpay_subscription_id": plus_sub_id,
    "razorpay_signature": "mock_signature_educap_test_123",
    "tier": "PLUS"
}, headers=headers)
print(res.json())
check_db()

print("--- 2. Switch from PLUS to PRO (Upgrade) ---")
res = requests.post(f"{BASE_URL}/api/subscriptions/switch", json={"tier": "PRO"}, headers=headers)
pro_sub_id = res.json()["subscription_id"]
res = requests.post(f"{BASE_URL}/api/subscriptions/confirm-payment", json={
    "razorpay_payment_id": "pay_fake2",
    "razorpay_subscription_id": pro_sub_id,
    "razorpay_signature": "mock_signature_educap_test_123",
    "tier": "PRO"
}, headers=headers)
print(res.json())
check_db()

print("--- 3. Switch from PRO to PLUS (Downgrade) ---")
res = requests.post(f"{BASE_URL}/api/subscriptions/switch", json={"tier": "PLUS"}, headers=headers)
plus2_sub_id = res.json()["subscription_id"]
res = requests.post(f"{BASE_URL}/api/subscriptions/confirm-payment", json={
    "razorpay_payment_id": "pay_fake3",
    "razorpay_subscription_id": plus2_sub_id,
    "razorpay_signature": "mock_signature_educap_test_123",
    "tier": "PLUS"
}, headers=headers)
print(res.json())
check_db()

print("--- 4. Downgrade to FREE (Immediate Cancel) ---")
res = requests.post(f"{BASE_URL}/api/subscriptions/cancel", json={"immediate": True}, headers=headers)
print(res.json())
check_db()
