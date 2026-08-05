import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuthStore } from "../store";

interface SubscriptionState {
  tier: "FREE" | "PLUS" | "PRO";
  status: "ACTIVE" | "CANCELLED" | "PAST_DUE" | "EXPIRED";
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const { user } = useAuthStore();

  const fetchSubscription = async () => {
    try {
      const res = await api.get("/api/subscriptions/me");
      setSubscription(res.data);
    } catch (err) {
      console.error("Failed to fetch subscription", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPolling) {
      interval = setInterval(async () => {
        await fetchSubscription();
      }, 2000);
      
      // Stop polling after 30 seconds to prevent infinite loops
      setTimeout(() => {
        setIsPolling(false);
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [isPolling]);

  // Load Razorpay Custom Checkout SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/razorpay.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Expose function for UI to manually start polling
  const startPolling = () => {
    setIsPolling(true);
  };

  const cancelSubscription = async () => {
    try {
      await api.post("/api/subscriptions/cancel");
      await fetchSubscription();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to cancel subscription");
    }
  };

  return {
    subscription,
    loading,
    isPolling,
    startPolling,
    cancelSubscription,
    refresh: fetchSubscription,
  };
}
