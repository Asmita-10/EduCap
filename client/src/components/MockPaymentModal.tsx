import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, CreditCard, Lock, CheckCircle2, Loader2,
  ShieldCheck, QrCode, Building2, GraduationCap,
} from "lucide-react";

interface MockPaymentModalProps {
  isOpen: boolean;
  tier: "PLUS" | "PRO";
  amount: number;
  onSuccess: (paymentId: string, subscriptionId: string, signature: string) => void;
  onDismiss: () => void;
}

type Step = "form" | "processing" | "success";
type PayMethod = "card" | "upi" | "netbanking";

export default function MockPaymentModal({
  isOpen, tier, amount, onSuccess, onDismiss,
}: MockPaymentModalProps) {

  const [step, setStep]               = useState<Step>("form");
  const [method, setMethod]           = useState<PayMethod>("card");
  const [cardNumber, setCardNumber]   = useState("");
  const [expiry, setExpiry]           = useState("");
  const [cvv, setCvv]                 = useState("");
  const [name, setName]               = useState("");
  const [errors, setErrors]           = useState<Record<string, string>>({});

  const rupees = (amount / 100).toFixed(0);
  const planLabel = tier === "PRO" ? "PRO Plan Subscription" : "PLUS Plan Subscription";

  /* ── formatters ─────────────────────────────────────────── */
  const fmtCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const fmtExp = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  };

  /* ── validation ─────────────────────────────────────────── */
  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())                               e.name   = "Cardholder name is required";
    if (cardNumber.replace(/\s/g, "").length !== 16) e.card   = "Enter a valid 16-digit card number";
    if (!/^\d{2}\/\d{2}$/.test(expiry))             e.expiry = "Enter expiry as MM/YY";
    if (cvv.length < 3)                             e.cvv    = "Enter a valid CVV";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── mock pay ───────────────────────────────────────────── */
  const handlePay = async () => {
    if (method !== "card") return; // only card active in mock
    if (!validate()) return;
    setStep("processing");
    await new Promise(r => setTimeout(r, 2000));
    const pid = "pay_mock_" + Math.random().toString(36).substring(2, 14).toUpperCase();
    const sid = "sub_mock_" + Math.random().toString(36).substring(2, 14).toUpperCase();
    const sig = Array.from({ length: 64 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
    setStep("success");
    await new Promise(r => setTimeout(r, 1200));
    onSuccess(pid, sid, sig);
  };

  const handleClose = () => {
    if (step === "processing") return;
    setStep("form"); setCardNumber(""); setExpiry(""); setCvv(""); setName(""); setErrors({});
    onDismiss();
  };

  /* ── shared input class ─────────────────────────────────── */
  const inputCls = (field?: string) =>
    `w-full px-3.5 py-2.5 bg-slate-50 border ${
      field && errors[field] ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : "border-slate-200 focus:border-teal-500 focus:ring-teal-500/20"
    } rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:ring-2 outline-none transition-all duration-200`;

  const tabs: { id: PayMethod; label: string; icon: React.ReactNode }[] = [
    { id: "card",       label: "Card",        icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: "upi",        label: "UPI",         icon: <QrCode className="w-3.5 h-3.5" /> },
    { id: "netbanking", label: "Net Banking",  icon: <Building2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ─────────────────────────────────── */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={step !== "processing" ? handleClose : undefined}
          />

          {/* ── Modal wrapper ────────────────────────────── */}
          <motion.div
            key="modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
          >
            <div className="bg-white max-w-md w-full rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden relative">

              {/* ═══ HEADER ════════════════════════════════ */}
              <div
                className="relative px-5 py-4 flex items-center justify-between"
                style={{ background: "linear-gradient(135deg, #1a2234 0%, #2e3a59 50%, #1a2234 100%)" }}
              >
                {/* brand */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(74,157,142,0.2)", border: "1px solid rgba(74,157,142,0.3)" }}>
                    <GraduationCap className="w-5 h-5" style={{ color: "#5cc4b3" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-base leading-snug">EduCap</p>
                    <p className="text-slate-300 text-xs font-medium leading-tight mt-0.5">{planLabel}</p>
                  </div>
                </div>

                {/* close */}
                <button
                  onClick={handleClose}
                  disabled={step === "processing"}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <X className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                </button>
              </div>

              {/* ═══ AMOUNT BANNER ═════════════════════════ */}
              <div className="px-5 py-3 flex items-baseline justify-between border-b border-slate-100"
                style={{ background: "rgba(74,157,142,0.05)" }}>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Amount to pay</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-extrabold text-slate-900 tracking-tight">₹{rupees}</span>
                  <span className="text-xs text-slate-400 font-normal ml-0.5">/month</span>
                </div>
              </div>

              {/* ═══ BODY ══════════════════════════════════ */}
              <div className="px-5 pt-5 pb-4">

                {/* ── FORM STEP ──────────────────────────── */}
                {step === "form" && (
                  <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

                    {/* Payment method tabs */}
                    <div className="bg-slate-100 p-1 rounded-xl flex gap-1 mb-5 border border-slate-200/60">
                      {tabs.map(t => (
                        <button
                          key={t.id}
                          onClick={() => setMethod(t.id)}
                          disabled={t.id !== "card"}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg transition-all duration-200 ${
                            method === t.id
                              ? "bg-white text-slate-900 shadow-sm font-semibold"
                              : t.id !== "card"
                              ? "text-slate-400 cursor-not-allowed opacity-60"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {t.icon}
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Form fields */}
                    <div className="flex flex-col gap-4">

                      {/* Cardholder Name */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Name on card"
                          className={inputCls("name")}
                        />
                        {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
                      </div>

                      {/* Card Number */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                          Card Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={e => setCardNumber(fmtCard(e.target.value))}
                            placeholder="4111 1111 1111 1111"
                            className={`${inputCls("card")} pr-11 font-mono tracking-widest`}
                          />
                          <CreditCard
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ width: 18, height: 18, color: "#cbd5e1" }}
                          />
                        </div>
                        {errors.card && <p className="text-[11px] text-red-500 mt-1">{errors.card}</p>}
                      </div>

                      {/* Expiry + CVV */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                            Expiry
                          </label>
                          <input
                            type="text"
                            value={expiry}
                            onChange={e => setExpiry(fmtExp(e.target.value))}
                            placeholder="MM/YY"
                            className={`${inputCls("expiry")} font-mono`}
                          />
                          {errors.expiry && <p className="text-[11px] text-red-500 mt-1">{errors.expiry}</p>}
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                            CVV
                          </label>
                          <input
                            type="password"
                            value={cvv}
                            onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            placeholder="•••"
                            className={`${inputCls("cvv")} font-mono text-center`}
                          />
                          {errors.cvv && <p className="text-[11px] text-red-500 mt-1">{errors.cvv}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Pay button */}
                    <button
                      onClick={handlePay}
                      className="w-full mt-5 py-3 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                      style={{ background: "linear-gradient(135deg, #4A9D8E 0%, #3d8678 100%)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "linear-gradient(135deg, #3d8678 0%, #357a6d 100%)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "linear-gradient(135deg, #4A9D8E 0%, #3d8678 100%)")}
                    >
                      <Lock className="w-4 h-4" />
                      Pay ₹{rupees} Securely
                    </button>

                    {/* Security badges */}
                    <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        256-bit SSL
                      </span>
                      <span className="w-px h-3 bg-slate-200" />
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        PCI DSS Compliant
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* ── PROCESSING STEP ────────────────────── */}
                {step === "processing" && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="py-10 flex flex-col items-center gap-5"
                  >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(74,157,142,0.1)" }}>
                      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#4A9D8E" }} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-slate-800 text-base">Processing Payment</p>
                      <p className="text-sm text-slate-500 mt-1">Please do not close this window…</p>
                    </div>
                    <div className="w-48 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: "#4A9D8E" }}
                        initial={{ width: "0%" }}
                        animate={{ width: "90%" }}
                        transition={{ duration: 1.8, ease: "easeInOut" }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* ── SUCCESS STEP ───────────────────────── */}
                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                    className="py-10 flex flex-col items-center gap-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-9 h-9 text-emerald-500" />
                    </motion.div>
                    <div className="text-center">
                      <p className="font-bold text-slate-800 text-lg">Payment Successful!</p>
                      <p className="text-sm text-slate-500 mt-1">Welcome to EduCap {tier}!</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* ═══ FOOTER ════════════════════════════════ */}
              <div className="px-5 pb-4 text-center">
                <p className="text-[10px] text-slate-400">
                  Powered by{" "}
                  <span className="font-semibold text-slate-600">EduCap Payments</span>
                  {" "}· Test Mode
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
