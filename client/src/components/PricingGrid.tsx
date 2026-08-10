import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSubscription } from "../hooks/useSubscription";
import CustomCheckoutForm from "./CustomCheckoutForm";

interface PricingGridProps {
  currentTier?: string | null;
}

export default function PricingGrid({ currentTier }: PricingGridProps) {
  const navigate = useNavigate();
  const { isPolling, startPolling } = useSubscription();
  const [checkoutTier, setCheckoutTier] = useState<"PLUS" | "PRO" | null>(null);

  const handleSubscribe = (tier: "PLUS" | "PRO") => {
    // We only pass currentTier if user is logged in
    if (currentTier === null || currentTier === undefined) {
      navigate("/login?redirect=/dashboard");
      return;
    }
    setCheckoutTier(tier);
  };

  const handleSuccess = () => {
    setCheckoutTier(null);
    startPolling();
  };

  const activeTier = currentTier || "FREE";

  const CheckIcon = () => (
    <svg className="w-5 h-5 text-[var(--accent)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );

  const CrossIcon = () => (
    <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
      {/* Free Tier */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
        className="bg-white border border-gray-200 rounded-2xl px-8 py-6 flex flex-col h-full transition-all duration-200 ease-out transform translate-y-2 hover:translate-y-0 hover:shadow-lg hover:border-gray-300 motion-reduce:transition-none motion-reduce:hover:translate-y-2"
      >
        <div className="mb-2">
          <h3 className="text-[20px] font-bold text-gray-900 mb-1">Free</h3>
          <div className="text-[38px] font-bold text-gray-900">₹0<span className="text-[16px] text-gray-500 font-normal">/mo</span></div>
          <p className="text-[14px] text-gray-500 font-normal mt-3 mb-5">Essential tools to get started.</p>
        </div>
        
        <ul className="flex flex-col gap-3 mb-2">
          <li className="flex items-center gap-3"><CheckIcon /> <span className="text-[14px] text-gray-600">1 Saved Plan</span></li>
          <li className="flex items-center gap-3"><CrossIcon /> <span className="text-[14px] text-gray-400">AI Risk Reports</span></li>
          <li className="flex items-center gap-3"><CrossIcon /> <span className="text-[14px] text-gray-400">Compare Plans</span></li>
          <li className="flex items-center gap-3"><CrossIcon /> <span className="text-[14px] text-gray-400">PDF Export</span></li>
          <li className="flex items-center gap-3"><CrossIcon /> <span className="text-[14px] text-gray-400">Refi Tracking</span></li>
        </ul>

        <button 
          onClick={() => {
            if (currentTier === null || currentTier === undefined) navigate("/register");
          }}
          disabled={activeTier === "FREE" && currentTier !== null}
          className={`w-full h-11 mt-auto rounded-xl text-[14px] font-bold transition-colors duration-200 ${
            activeTier === "FREE" && currentTier !== null 
            ? "border border-gray-400 text-gray-500 bg-transparent opacity-80 cursor-not-allowed"
            : "bg-[#555a63] hover:bg-[#454a52] text-white"
          }`}
        >
          {currentTier === null || currentTier === undefined 
            ? "Get Started" 
            : activeTier === "FREE" ? "Current Plan" : "Included"}
        </button>
      </motion.div>

      {/* Plus Tier */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
        className="bg-white border border-gray-200 rounded-2xl px-8 py-6 flex flex-col h-full shadow-lg relative transition-all duration-200 ease-out transform translate-y-2 hover:translate-y-0 hover:shadow-xl hover:border-[var(--accent)] motion-reduce:transition-none motion-reduce:hover:translate-y-2"
      >
        <div className="mb-2">
          <h3 className="text-[20px] font-bold text-[var(--accent)] mb-1">Plus</h3>
          <div className="text-[38px] font-bold text-gray-900">₹100<span className="text-[16px] text-gray-500 font-normal">/mo</span></div>
          <p className="text-[14px] text-gray-500 font-normal mt-3 mb-5">Advanced insights for serious learners.</p>
        </div>
        
        <ul className="flex flex-col gap-3 mb-2">
          <li className="flex items-center gap-3"><CheckIcon /> <span className="text-[14px] text-gray-600">5 Saved Plans</span></li>
          <li className="flex items-center gap-3"><CheckIcon /> <span className="text-[14px] text-gray-600">AI Risk Reports</span></li>
          <li className="flex items-center gap-3"><CheckIcon /> <span className="text-[14px] text-gray-600">Compare Plans</span></li>
          <li className="flex items-center gap-3"><CheckIcon /> <span className="text-[14px] text-gray-600">PDF Export</span></li>
          <li className="flex items-center gap-3"><CrossIcon /> <span className="text-[14px] text-gray-400">Refi Tracking</span></li>
        </ul>

        <button 
          onClick={() => handleSubscribe("PLUS")}
          disabled={(activeTier === "PLUS" || activeTier === "PRO" || isPolling) && currentTier !== null}
          className={`w-full h-11 mt-auto rounded-xl text-[14px] font-bold transition-colors duration-200 ${
            activeTier === "PLUS" && currentTier !== null
            ? "border border-[var(--accent)] text-[var(--accent)] bg-transparent opacity-80 cursor-not-allowed"
            : "bg-[var(--accent)] hover:bg-[#0c5945] text-white disabled:opacity-50"
          }`}
        >
          {currentTier === null || currentTier === undefined 
            ? "Subscribe to Plus" 
            : activeTier === "PLUS" ? "Current Plan" : "Subscribe to Plus"}
        </button>
      </motion.div>

      {/* Pro Tier */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
        className="bg-white border border-gray-200 rounded-2xl px-8 py-6 flex flex-col h-full transition-all duration-200 ease-out transform translate-y-2 hover:translate-y-0 hover:shadow-lg hover:border-[var(--primary)] motion-reduce:transition-none motion-reduce:hover:translate-y-2"
      >
        <div className="mb-2">
          <h3 className="text-[20px] font-bold text-gray-700 mb-1">Pro</h3>
          <div className="text-[38px] font-bold text-gray-900">₹199<span className="text-[16px] text-gray-500 font-normal">/mo</span></div>
          <p className="text-[14px] text-gray-500 font-normal mt-3 mb-5">Complete suite for institutional planning.</p>
        </div>
        
        <ul className="flex flex-col gap-3 mb-2">
          <li className="flex items-center gap-3"><CheckIcon /> <span className="text-[14px] text-gray-600">Unlimited Saved Plans</span></li>
          <li className="flex items-center gap-3"><CheckIcon /> <span className="text-[14px] text-gray-600">AI Risk Reports</span></li>
          <li className="flex items-center gap-3"><CheckIcon /> <span className="text-[14px] text-gray-600">Compare Plans</span></li>
          <li className="flex items-center gap-3"><CheckIcon /> <span className="text-[14px] text-gray-600">PDF Export</span></li>
          <li className="flex items-center gap-3"><CheckIcon /> <span className="text-[14px] text-gray-600">Refi Tracking</span></li>
        </ul>

        <button 
          onClick={() => handleSubscribe("PRO")}
          disabled={(activeTier === "PRO" || isPolling) && currentTier !== null}
          className={`w-full h-11 mt-auto rounded-xl text-[14px] font-bold transition-colors duration-200 ${
            activeTier === "PRO" && currentTier !== null
            ? "border border-[var(--primary)] text-[var(--primary)] bg-transparent opacity-80 cursor-not-allowed"
            : "bg-[var(--primary)] hover:bg-[#1a233a] text-white disabled:opacity-50"
          }`}
        >
          {currentTier === null || currentTier === undefined 
            ? "Subscribe to Pro" 
            : activeTier === "PRO" ? "Current Plan" : "Subscribe to Pro"}
        </button>
      </motion.div>

      {checkoutTier && (
        <CustomCheckoutForm 
          tier={checkoutTier} 
          onClose={() => setCheckoutTier(null)} 
          onSuccess={handleSuccess} 
        />
      )}
    </div>
  );
}
