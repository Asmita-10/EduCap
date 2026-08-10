import React, { useState } from "react";
import api from "../services/api";
import { useAuthStore } from "../store";

interface CustomCheckoutFormProps {
  tier: "PLUS" | "PRO";
  onClose: () => void;
  onSuccess: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CustomCheckoutForm({ tier, onClose, onSuccess }: CustomCheckoutFormProps) {
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const price = tier === "PLUS" ? "100" : "199";

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const downloadReceipt = async (paymentId: string) => {
    try {
      const res = await api.get(`/api/subscriptions/receipt/${paymentId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `EduCap-Receipt-${paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.parentNode?.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("[receipt] PDF download failed", e);
    }
  };

  const handlePaymentSuccess = async (response: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }) => {
    try {
      // 1. HMAC verify on backend — Prisma upserts subscription tier to ACTIVE
      await api.post("/api/subscriptions/confirm-payment", {
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_subscription_id: response.razorpay_subscription_id,
        razorpay_signature: response.razorpay_signature,
        tier,
      });

      // 2. Immediately update Zustand store — dashboard shows PRO/PLUS without page reload
      if (user && accessToken && refreshToken) {
        setAuth({ ...user, tier }, accessToken, refreshToken);
      }

      // 3. Auto-download PDF receipt
      await downloadReceipt(response.razorpay_payment_id);

      // 4. Close modal & trigger subscription state refresh via useSubscription poll
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || "Payment verification failed. Please contact support.");
      setLoading(false);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setError("Razorpay SDK failed to load. Please check your connection.");
        setLoading(false);
        return;
      }

      const { data } = await api.post("/api/subscriptions/create-order", { tier });
      const { subscription_id, key_id } = data;

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded. Please refresh the page.");
      }

      // Standard Checkout for ALL payment types (card + UPI).
      // The headless createPayment() API blocks international card BINs even in test mode.
      // Standard Checkout runs on Razorpay's domain: card/UPI switching happens inside
      // the modal, and test mode shows Razorpay's mock bank auth screen.
      const options = {
        key: key_id,
        subscription_id,
        currency: "INR",
        name: "EduCap",
        description: `EduCap ${tier} Subscription — Rs.${price}/mo`,
        prefill: {
          email: user?.email || "test@educap.com",
          contact: "9999999999",
        },
        notes: { tier },
        theme: { color: "#10b981" },
        handler: handlePaymentSuccess,
        modal: {
          ondismiss: () => setLoading(false),
          confirm_close: true,
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (resp: any) => {
        const errStr = JSON.stringify(resp.error || {}).toLowerCase();
        if (errStr.includes("international")) {
          setError(
            "International cards are not supported on this test account. In Razorpay's modal, enter card 4111 1111 1111 1111 | Exp: 12/28 | CVV: 123 — or switch to UPI and type success@razorpay."
          );
        } else if (errStr.includes("recurring") || errStr.includes("not eligible")) {
          setError(
            "This card doesn't support recurring mandates. Use test Visa: 4111 1111 1111 1111 | Expiry: 12/28 | CVV: 123"
          );
        } else {
          setError(resp.error?.description || "Payment failed. Please try again.");
        }
        setLoading(false);
      });

      rzp.open();
    } catch (err: any) {
      console.error("[checkout]", err);
      setError(err.message || err.response?.data?.error || "Failed to open payment. Please refresh.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(9, 9, 15, 0.82)",
        backdropFilter: "blur(5px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        className="card animate-fadeInUp"
        style={{ width: "100%", maxWidth: "420px", padding: "36px", position: "relative" }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontSize: "1.2rem",
          }}
          aria-label="Close"
        >
          ✕
        </button>

        <h2 style={{ fontSize: "1.5rem", marginBottom: "6px" }}>Complete Payment</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "28px", fontSize: "0.9rem" }}>
          Subscribe to <strong>EduCap {tier}</strong> for Rs.{price}/mo.
        </p>

        {error && (
          <div
            style={{
              background: "var(--danger-bg)",
              color: "var(--danger)",
              padding: "12px 14px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontSize: "0.85rem",
              border: "1px solid var(--danger-light)",
              lineHeight: "1.5",
            }}
          >
            {error}
          </div>
        )}

        {/* Test Mode Helper */}
        <div
          style={{
            background: "rgba(16,185,129,0.07)",
            border: "1px solid rgba(16,185,129,0.25)",
            borderRadius: "8px",
            padding: "12px 14px",
            marginBottom: "24px",
            fontSize: "0.82rem",
            color: "var(--text-muted)",
            lineHeight: "1.7",
          }}
        >
          <strong style={{ color: "var(--accent)" }}>Test Mode</strong>
          <br />
          In the Razorpay popup, use:
          <br />
          Card: <code style={{ userSelect: "all" }}>4111 1111 1111 1111</code> | Exp:{" "}
          <code>12/28</code> | CVV: <code>123</code>
          <br />
          <em>or</em> switch to UPI and type <code>success@razorpay</code>
        </div>

        <form onSubmit={handlePay}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", padding: "14px" }}
          >
            {loading ? "Opening Payment..." : `Pay Rs.${price} via Razorpay`}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            fontSize: "0.73rem",
            color: "var(--text-dim)",
            marginTop: "18px",
          }}
        >
          Secured by Razorpay. A popup will open — select Card or UPI inside the Razorpay window.
        </p>
      </div>
    </div>
  );
}
