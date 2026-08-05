import React, { useState } from "react";
import api from "../services/api";
import { useAuthStore } from "../store";

interface CustomCheckoutFormProps {
  tier: "PLUS" | "PRO";
  onClose: () => void;
  onSuccess: () => void;
}

export default function CustomCheckoutForm({ tier, onClose, onSuccess }: CustomCheckoutFormProps) {
  const { user } = useAuthStore();
  const [method, setMethod] = useState<"card" | "upi">("card");
  
  // Card state
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

  // UPI state
  const [vpa, setVpa] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Create Subscription
      const orderRes = await api.post("/api/subscriptions/create-order", { tier });
      const { subscription_id, amount, key_id } = orderRes.data;

      // 2. Setup Razorpay
      const options = {
        key: key_id,
        subscription_id,
        amount,
        name: "EduCap",
        description: `EduCap ${tier} Subscription`,
        prefill: {
          email: user?.email || "test@educap.com",
          contact: "9999999999"
        },
      };

      const rzp = new (window as any).Razorpay(options);

      // Define payment data based on method
      let paymentData: any = {
        amount,
        email: user?.email || "test@educap.com",
        contact: "9999999999",
        recurring: "1",
      };

      if (method === "card") {
        const [month, year] = expiry.split("/");
        paymentData = {
          ...paymentData,
          method: "card",
          'card[name]': name || "Test User",
          'card[number]': cardNumber.replace(/\s+/g, ''),
          'card[expiry_month]': month,
          'card[expiry_year]': year,
          'card[cvv]': cvv,
        };
      } else {
        paymentData = {
          ...paymentData,
          method: "upi",
          vpa,
        };
      }

      // Handle successful payment
      rzp.on('payment.success', async function (response: any) {
        try {
          await api.post("/api/subscriptions/confirm-payment", {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
            tier
          });
          onSuccess();
        } catch (err: any) {
          setError(err.response?.data?.error || "Payment verification failed.");
          setLoading(false);
        }
      });

      // Handle payment failure
      rzp.on('payment.error', function (resp: any) {
        setError(resp.error?.description || "Payment failed.");
        setLoading(false);
      });

      // 3. Headless submission
      rzp.createPayment(paymentData);

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to initiate payment");
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(9, 9, 15, 0.8)",
      backdropFilter: "blur(4px)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px"
    }}>
      <div className="card animate-fadeInUp" style={{ width: "100%", maxWidth: "400px", padding: "32px", position: "relative" }}>
        <button 
          onClick={onClose}
          style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}
        >
          ✕
        </button>

        <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Complete Payment</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "24px", fontSize: "0.9rem" }}>
          Subscribe to EduCap {tier} for ₹{tier === "PLUS" ? "100" : "199"}/mo.
        </p>

        {error && (
          <div style={{ background: "var(--danger-bg)", color: "var(--danger)", padding: "12px", borderRadius: "8px", marginBottom: "24px", fontSize: "0.85rem", border: "1px solid var(--danger-light)" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          <button 
            type="button"
            onClick={() => setMethod("card")}
            style={{ 
              flex: 1, padding: "10px", borderRadius: "8px", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
              background: method === "card" ? "rgba(108, 71, 255, 0.15)" : "transparent",
              color: method === "card" ? "var(--primary-light)" : "var(--text-muted)",
              border: method === "card" ? "1px solid var(--primary-light)" : "1px solid var(--border)"
            }}
          >
            Credit / Debit Card
          </button>
          <button 
            type="button"
            onClick={() => setMethod("upi")}
            style={{ 
              flex: 1, padding: "10px", borderRadius: "8px", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
              background: method === "upi" ? "rgba(108, 71, 255, 0.15)" : "transparent",
              color: method === "upi" ? "var(--primary-light)" : "var(--text-muted)",
              border: method === "upi" ? "1px solid var(--primary-light)" : "1px solid var(--border)"
            }}
          >
            UPI
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {method === "card" ? (
            <>
              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="4111 1111 1111 1111" 
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Expiry</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="MM/YY" 
                    value={expiry}
                    onChange={e => setExpiry(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">CVV</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="123" 
                    value={cvv}
                    onChange={e => setCvv(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Name on Card</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="John Doe" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="form-group">
              <label className="form-label">UPI ID / VPA</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="success@razorpay" 
                value={vpa}
                onChange={e => setVpa(e.target.value)}
                required
              />
              <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "4px" }}>
                Test mode: use success@razorpay
              </p>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", marginTop: "16px" }}
          >
            {loading ? "Processing..." : `Pay ₹${tier === "PLUS" ? "100" : "199"}`}
          </button>
        </form>
        
        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "20px" }}>
          Secured by Razorpay. An authentication popup may appear for verification.
        </p>
      </div>
    </div>
  );
}
