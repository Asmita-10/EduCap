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

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
      {/* FREE */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
        className="bg-[var(--bg-card)] border-2 border-[var(--border)] rounded-2xl p-8 flex flex-col gap-8 h-full text-[var(--text)] transition-colors duration-200 hover:border-[var(--accent)] hover:shadow-xl"
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-[var(--primary)]">Free</h2>
          <div className="text-4xl font-extrabold">₹0<span className="text-lg text-[var(--text-muted)] font-normal">/mo</span></div>
        </div>
        
        <ul className="flex flex-col gap-4 text-[var(--text-muted)] text-left">
          <li className="flex items-center gap-3"><span className="text-green-500 font-bold w-5 text-center flex-shrink-0">✓</span> <span className="text-[var(--text)]">1 Saved Plan</span></li>
          <li className="flex items-center gap-3"><span className="text-gray-400 font-bold w-5 text-center flex-shrink-0">✗</span> <span>AI Risk Reports</span></li>
          <li className="flex items-center gap-3"><span className="text-gray-400 font-bold w-5 text-center flex-shrink-0">✗</span> <span>Compare Plans side-by-side</span></li>
          <li className="flex items-center gap-3"><span className="text-gray-400 font-bold w-5 text-center flex-shrink-0">✗</span> <span>PDF Export</span></li>
          <li className="flex items-center gap-3"><span className="text-gray-400 font-bold w-5 text-center flex-shrink-0">✗</span> <span>Refi Tracking</span></li>
        </ul>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (currentTier === null || currentTier === undefined) navigate("/register");
          }}
          disabled={activeTier === "FREE" && currentTier !== null}
          className="w-full h-12 px-6 mt-auto rounded-lg font-semibold border-2 border-[var(--primary)] text-[var(--primary)] disabled:opacity-50 transition-colors duration-200 bg-transparent hover:bg-[var(--primary)] hover:text-white"
        >
          {currentTier === null || currentTier === undefined 
            ? "Get Started" 
            : activeTier === "FREE" ? "Current Plan" : "Included"}
        </motion.button>
      </motion.div>

      {/* PLUS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
        className="bg-[var(--bg-card)] border-2 border-[var(--border)] rounded-2xl p-8 flex flex-col gap-8 h-full text-[var(--text)] transition-colors duration-200 hover:border-[var(--accent)] hover:shadow-xl"
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-[var(--accent)]">Plus</h2>
          <div className="text-4xl font-extrabold">₹100<span className="text-lg text-[var(--text-muted)] font-normal">/mo</span></div>
        </div>

        <ul className="flex flex-col gap-4 text-[var(--text)] text-left">
          <li className="flex items-center gap-3"><span className="text-green-500 font-bold w-5 text-center flex-shrink-0">✓</span> <span>5 Saved Plans</span></li>
          <li className="flex items-center gap-3"><span className="text-green-500 font-bold w-5 text-center flex-shrink-0">✓</span> <span>AI Risk Reports</span></li>
          <li className="flex items-center gap-3"><span className="text-green-500 font-bold w-5 text-center flex-shrink-0">✓</span> <span>Compare Plans side-by-side</span></li>
          <li className="flex items-center gap-3"><span className="text-green-500 font-bold w-5 text-center flex-shrink-0">✓</span> <span>PDF Export</span></li>
          <li className="flex items-center gap-3 text-[var(--text-muted)]"><span className="text-gray-400 font-bold w-5 text-center flex-shrink-0">✗</span> <span>Refi Tracking</span></li>
        </ul>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSubscribe("PLUS")}
          disabled={(activeTier === "PLUS" || activeTier === "PRO" || isPolling) && currentTier !== null}
          className="w-full h-12 px-6 mt-auto rounded-lg font-semibold border-none disabled:opacity-50 cursor-pointer transition-colors duration-200 bg-[var(--accent)] hover:bg-[#3f8679] text-white"
        >
          {currentTier === null || currentTier === undefined 
            ? "Subscribe to Plus" 
            : activeTier === "PLUS" ? "Current Plan" : "Subscribe to Plus"}
        </motion.button>
      </motion.div>

      {/* PRO */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
        className="bg-[var(--bg-card)] border-2 border-[var(--border)] rounded-2xl p-8 flex flex-col gap-8 h-full text-[var(--text)] transition-colors duration-200 hover:border-[var(--accent)] hover:shadow-xl"
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-[var(--primary)]">Pro</h2>
          <div className="text-4xl font-extrabold">₹199<span className="text-lg text-[var(--text-muted)] font-normal">/mo</span></div>
        </div>

        <ul className="flex flex-col gap-4 text-[var(--text)] text-left">
          <li className="flex items-center gap-3"><span className="text-green-500 font-bold w-5 text-center flex-shrink-0">✓</span> <span>Unlimited Saved Plans</span></li>
          <li className="flex items-center gap-3"><span className="text-green-500 font-bold w-5 text-center flex-shrink-0">✓</span> <span>AI Risk Reports</span></li>
          <li className="flex items-center gap-3"><span className="text-green-500 font-bold w-5 text-center flex-shrink-0">✓</span> <span>Compare Plans side-by-side</span></li>
          <li className="flex items-center gap-3"><span className="text-green-500 font-bold w-5 text-center flex-shrink-0">✓</span> <span>PDF Export</span></li>
          <li className="flex items-center gap-3"><span className="text-green-500 font-bold w-5 text-center flex-shrink-0">✓</span> <span>Refi Tracking</span></li>
        </ul>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSubscribe("PRO")}
          disabled={(activeTier === "PRO" || isPolling) && currentTier !== null}
          className="w-full h-12 px-6 mt-auto rounded-lg font-semibold border-none disabled:opacity-50 cursor-pointer transition-colors duration-200 bg-[var(--primary)] hover:bg-[#1a233a] text-white"
        >
          {currentTier === null || currentTier === undefined 
            ? "Subscribe to Pro" 
            : activeTier === "PRO" ? "Current Plan" : "Subscribe to Pro"}
        </motion.button>
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
