import React, { useState } from "react";
import { useSubscription } from "../hooks/useSubscription";

export default function SubscriptionManager() {
  const { subscription, loading, cancelSubscription } = useSubscription();
  const [showConfirm, setShowConfirm] = useState(false);

  if (loading || !subscription) return null;

  const activeTier = subscription.status === "ACTIVE" ? subscription.tier : "FREE";

  if (activeTier === "FREE") {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <h3 className="text-lg font-bold text-white">Current Tier: FREE</h3>
          <p className="text-sm text-gray-300 mt-1">Upgrade to save more plans and unlock AI reports.</p>
        </div>
        <a href="#pricing" className="px-6 py-2.5 bg-[var(--accent)] text-white rounded-lg hover:bg-[#3f8679] transition-colors font-semibold shadow-sm whitespace-nowrap">
          Upgrade
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-3">
            Current Tier: <span className="text-primary-light">{activeTier}</span>
            {subscription.cancelAtPeriodEnd && (
              <span className="text-xs bg-red-900/50 text-red-400 px-2 py-1 rounded-full border border-red-800">
                Cancels soon
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {subscription.cancelAtPeriodEnd 
              ? "Your subscription will end on" 
              : "Next billing date:"} 
            {" "}
            <span className="text-white">
              {new Date(subscription.currentPeriodEnd!).toLocaleDateString()}
            </span>
          </p>
        </div>
        {!subscription.cancelAtPeriodEnd && (
          <button 
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
          >
            Cancel Subscription
          </button>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full">
            <h4 className="text-xl font-bold text-white mb-2">Cancel Subscription?</h4>
            <p className="text-gray-400 mb-6 text-sm">
              You will continue to have access to all {activeTier} features until the end of your current billing period ({new Date(subscription.currentPeriodEnd!).toLocaleDateString()}).
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Keep it
              </button>
              <button 
                onClick={async () => {
                  await cancelSubscription();
                  setShowConfirm(false);
                }}
                className="px-4 py-2 bg-red-600/90 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
