import { useState, useEffect } from "react";
import { useSubscription } from "../hooks/useSubscription";
import { useAuthStore } from "../store";
import api from "../services/api";

export default function SubscriptionManager() {
  const { subscription, loading, cancelSubscription } = useSubscription();
  const { user } = useAuthStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/api/subscriptions/history");
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user, subscription]);

  if (loading || !subscription) return null;

  const activeTier = subscription.status === "ACTIVE" ? subscription.tier : "FREE";

  const handleDownloadReceipt = (tx: any) => {
    api.get(`/api/subscriptions/receipt/${tx.transactionId}`, { responseType: "blob" })
      .then((response) => {
        const blobUrl = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `Receipt_${tx.transactionId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => alert("Failed to download receipt"));
  };

  // If user is FREE and has no transactions, don't show the subscription manager card
  if (activeTier === "FREE" && transactions.length === 0) {
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. Subscription Manager Details Card */}
      {activeTier !== "FREE" && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "8px" }}>
                Current Plan: <span style={{ color: "var(--accent)" }}>{activeTier}</span>
                {subscription.cancelAtPeriodEnd && (
                  <span className="badge badge-danger">
                    Canceling soon
                  </span>
                )}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                {subscription.cancelAtPeriodEnd 
                  ? "Your subscription will end on" 
                  : "Next billing date:"}{" "}
                <strong style={{ color: "var(--text)" }}>
                  {new Date(subscription.currentPeriodEnd!).toLocaleDateString()}
                </strong>
              </p>
            </div>
            {!subscription.cancelAtPeriodEnd && (
              <button 
                onClick={() => setShowConfirm(true)}
                className="btn btn-secondary btn-sm"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(9, 9, 15, 0.65)",
          backdropFilter: "blur(6px)",
          zIndex: 1050,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px"
        }}>
          <div className="card animate-fadeInUp" style={{ width: "100%", maxWidth: "420px", padding: "28px" }}>
            <h4 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>Cancel Subscription?</h4>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px", fontSize: "0.85rem" }}>
              You will continue to have access to all {activeTier} features until the end of your current billing period ({new Date(subscription.currentPeriodEnd!).toLocaleDateString()}).
            </p>
            <div style={{ display: "flex", justifyItems: "flex-end", justifyContent: "flex-end", gap: "10px" }}>
              <button 
                onClick={() => setShowConfirm(false)}
                className="btn btn-secondary btn-sm"
              >
                Keep Plan
              </button>
              <button 
                onClick={async () => {
                  await cancelSubscription();
                  setShowConfirm(false);
                }}
                className="btn btn-danger btn-sm"
              >
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Transaction History List */}
      {transactions.length > 0 && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1.15rem", color: "var(--text)" }}>Payment History</h3>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
                  <th style={{ padding: "10px 8px", fontWeight: 600 }}>Payment ID</th>
                  <th style={{ padding: "10px 8px", fontWeight: 600 }}>Date</th>
                  <th style={{ padding: "10px 8px", fontWeight: 600 }}>Description</th>
                  <th style={{ padding: "10px 8px", fontWeight: 600 }}>Method</th>
                  <th style={{ padding: "10px 8px", fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: "10px 8px", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "10px 8px", fontWeight: 600, textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.transactionId} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 8px", fontFamily: "monospace", color: "var(--accent)", fontWeight: 500 }}>
                      {tx.transactionId}
                    </td>
                    <td style={{ padding: "12px 8px", color: "var(--text)" }}>
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px 8px", color: "var(--text)" }}>
                      {tx.description}
                    </td>
                    <td style={{ padding: "12px 8px", color: "var(--text-muted)" }}>
                      {tx.paymentMethod}
                    </td>
                    <td style={{ padding: "12px 8px", color: "var(--text)", fontWeight: 700 }}>
                      ₹{tx.amount}.00
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <span className="badge badge-safe" style={{ padding: "2px 8px", fontSize: "0.7rem" }}>
                        SUCCESS
                      </span>
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "right" }}>
                      <button 
                        onClick={() => handleDownloadReceipt(tx)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--accent)",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: "0.8rem",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
