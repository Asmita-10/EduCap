import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Lock, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

interface MockPaymentModalProps {
  isOpen: boolean;
  tier: "PLUS" | "PRO";
  amount: number;
  onSuccess: (paymentId: string, subscriptionId: string, signature: string) => void;
  onDismiss: () => void;
}

type Step = "form" | "processing" | "success";

/* ── card brand detection ────────────────────────────────── */
function detectBrand(num: string): "visa" | "mastercard" | "amex" | null {
  const raw = num.replace(/\s/g, "");
  if (/^4/.test(raw)) return "visa";
  if (/^5[1-5]/.test(raw) || /^2[2-7]/.test(raw)) return "mastercard";
  if (/^3[47]/.test(raw)) return "amex";
  return null;
}

function CardBrandIcon({ brand }: { brand: ReturnType<typeof detectBrand> }) {
  if (brand === "visa") {
    return (
      <svg viewBox="0 0 48 16" className="w-10 h-auto" aria-label="Visa">
        <text x="0" y="13" fontFamily="Arial Black, sans-serif" fontWeight="900"
          fontSize="15" fill="#1A1F71" letterSpacing="-0.5">VISA</text>
      </svg>
    );
  }
  if (brand === "mastercard") {
    return (
      <svg viewBox="0 0 38 24" className="w-8 h-auto" aria-label="Mastercard">
        <circle cx="13" cy="12" r="11" fill="#EB001B" />
        <circle cx="25" cy="12" r="11" fill="#F79E1B" />
        <path d="M19 4.8a11 11 0 0 1 0 14.4A11 11 0 0 1 19 4.8z" fill="#FF5F00" />
      </svg>
    );
  }
  if (brand === "amex") {
    return (
      <svg viewBox="0 0 48 16" className="w-10 h-auto" aria-label="Amex">
        <text x="0" y="13" fontFamily="Arial Black, sans-serif" fontWeight="900"
          fontSize="10" fill="#007BC1" letterSpacing="0.5">AMEX</text>
      </svg>
    );
  }
  return <CreditCard className="w-5 h-5 text-gray-300" />;
}

export default function MockPaymentModal({
  isOpen, tier, amount, onSuccess, onDismiss,
}: MockPaymentModalProps) {

  const [step, setStep]             = useState<Step>("form");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry]         = useState("");
  const [cvv, setCvv]               = useState("");
  const [name, setName]             = useState("");
  const [errors, setErrors]         = useState<Record<string, string>>({});

  const rupees = (amount / 100).toFixed(0);
  const brand  = detectBrand(cardNumber);

  /* ── formatters ──────────────────────────────────────────── */
  const fmtCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const fmtExp = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  };

  /* ── validation ──────────────────────────────────────────── */
  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())                               e.name   = "Cardholder name is required";
    if (cardNumber.replace(/\s/g, "").length !== 16) e.card  = "Enter a valid 16-digit card number";
    if (!/^\d{2}\/\d{2}$/.test(expiry))             e.expiry = "Enter expiry as MM/YY";
    if (cvv.length < 3)                             e.cvv    = "Enter a valid CVV";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── mock pay ────────────────────────────────────────────── */
  const handlePay = async () => {
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

  /* ── shared input class builder ──────────────────────────── */
  const inputCls = (field: string) =>
    [
      "w-full border rounded-[10px] bg-white px-4 h-12 text-sm text-gray-800",
      "placeholder:text-gray-400",
      "focus:outline-none focus:ring-2 focus:ring-[#4A9D8E]/20 focus:border-[#4A9D8E]",
      "transition-all duration-150",
      errors[field] ? "border-red-400" : "border-gray-200",
    ].join(" ");

  /* ── label ───────────────────────────────────────────────── */
  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-400 mb-2 select-none">
      {children}
    </label>
  );

  /* ── error hint ──────────────────────────────────────────── */
  const Err = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-[11px] text-red-500 mt-1.5">{errors[field]}</p> : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/55 backdrop-blur-[8px] z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={step !== "processing" ? handleClose : undefined}
          />

          {/* modal centering wrapper */}
          <motion.div
            key="modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
          >
            {/* ── MODAL SHELL ─────────────────────────────────── */}
            <div
              className="bg-white rounded-2xl w-full max-w-[420px] overflow-hidden"
              style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.10)" }}
            >

              {/* ═══ HEADER ════════════════════════════════════ */}
              <div className="bg-[#2E3A59] px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
                    <span className="text-white font-bold text-sm tracking-wide">EC</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-[16px] leading-tight tracking-tight">EduCap</p>
                    <p className="text-white/55 text-[12px] leading-tight mt-1">{tier} Plan Subscription</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={step === "processing"}
                  className="w-8 h-8 flex items-center justify-center rounded-lg
                             text-white/50 hover:text-white hover:bg-white/10
                             transition-colors disabled:opacity-20 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <X className="w-[18px] h-[18px]" />
                </button>
              </div>

              {/* ═══ AMOUNT BANNER ═════════════════════════════ */}
              <div className="bg-[#4A9D8E]/8 border-b border-[#4A9D8E]/15 px-6 py-3.5 flex items-baseline justify-between">
                <span className="text-[13px] text-gray-500 font-medium">Amount to pay</span>
                <span className="text-[22px] font-bold text-[#2E3A59] leading-none">
                  ₹{rupees}
                  <span className="text-[13px] font-normal text-gray-400 ml-0.5">/mo</span>
                </span>
              </div>

              {/* ═══ BODY ══════════════════════════════════════ */}
              <div className="px-6 pt-5 pb-6">

                {/* ── FORM STEP ──────────────────────────────── */}
                {step === "form" && (
                  <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

                    {/* ── SEGMENTED PAYMENT METHOD TABS ────────── */}
                    <div className="flex bg-gray-100 rounded-xl p-1 gap-1 mb-6">
                      {[
                        { label: "Card", icon: <CreditCard className="w-3.5 h-3.5" />, active: true  },
                        { label: "UPI",  icon: null,                                    active: false },
                        { label: "Net Banking", icon: null,                             active: false },
                      ].map(t => (
                        <button
                          key={t.label}
                          disabled={!t.active}
                          className={
                            "flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-[12.5px] font-semibold " +
                            "transition-all duration-200 select-none " +
                            (t.active
                              ? "bg-[#4A9D8E] text-white shadow-sm"
                              : "text-gray-400 cursor-not-allowed")
                          }
                        >
                          {t.icon}{t.label}
                        </button>
                      ))}
                    </div>

                    {/* ── FIELDS ───────────────────────────────── */}
                    <div className="flex flex-col gap-5">

                      {/* cardholder name */}
                      <div>
                        <Label>Cardholder Name</Label>
                        <input
                          type="text" value={name} onChange={e => setName(e.target.value)}
                          placeholder="Name on card"
                          className={inputCls("name")}
                        />
                        <Err field="name" />
                      </div>

                      {/* card number */}
                      <div>
                        <Label>Card Number</Label>
                        <div className="relative">
                          <input
                            type="text" value={cardNumber}
                            onChange={e => setCardNumber(fmtCard(e.target.value))}
                            placeholder="4111 1111 1111 1111"
                            maxLength={19}
                            className={inputCls("card") + " pr-14 font-mono tracking-widest"}
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                            <CardBrandIcon brand={brand} />
                          </span>
                        </div>
                        <Err field="card" />
                      </div>

                      {/* expiry + cvv (50/50 grid, 16px gap) */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Expiry</Label>
                          <input
                            type="text" value={expiry}
                            onChange={e => setExpiry(fmtExp(e.target.value))}
                            placeholder="MM/YY"
                            maxLength={5}
                            className={inputCls("expiry") + " font-mono"}
                          />
                          <Err field="expiry" />
                        </div>
                        <div>
                          <Label>CVV</Label>
                          <input
                            type="password" value={cvv}
                            onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            placeholder="•••"
                            maxLength={4}
                            className={inputCls("cvv") + " font-mono text-center"}
                          />
                          <Err field="cvv" />
                        </div>
                      </div>
                    </div>

                    {/* ── PAY BUTTON ──────────────────────────── */}
                    <button
                      onClick={handlePay}
                      className="w-full mt-6 bg-[#4A9D8E] hover:bg-[#3d8678] active:scale-[0.98] active:bg-[#357a6d]
                        text-white font-semibold rounded-[10px]
                        transition-all duration-150
                        flex items-center justify-center gap-2.5 text-[15px]"
                      style={{ height: "52px" }}
                    >
                      <Lock className="w-4 h-4 flex-shrink-0" />
                      Pay ₹{rupees} Securely
                    </button>

                    {/* ── TRUST BADGES ────────────────────────── */}
                    <div className="mt-4 flex items-center justify-center gap-6">
                      <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                        256-bit SSL
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                        PCI DSS Secure
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* ── PROCESSING STEP ──────────────────────────── */}
                {step === "processing" && (
                  <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="py-12 flex flex-col items-center gap-5"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#4A9D8E]/10 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-[#4A9D8E] animate-spin" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-800 text-[15px]">Processing Payment</p>
                      <p className="text-[13px] text-gray-500 mt-1">Please do not close this window…</p>
                    </div>
                    <div className="w-48 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <motion.div className="h-full bg-[#4A9D8E] rounded-full"
                        initial={{ width: "0%" }} animate={{ width: "90%" }}
                        transition={{ duration: 1.8, ease: "easeInOut" }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* ── SUCCESS STEP ─────────────────────────────── */}
                {step === "success" && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                    className="py-12 flex flex-col items-center gap-4"
                  >
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-9 h-9 text-emerald-500" />
                    </motion.div>
                    <div className="text-center">
                      <p className="font-bold text-gray-800 text-lg">Payment Successful!</p>
                      <p className="text-[13px] text-gray-500 mt-1">Welcome to EduCap {tier} 🎉</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* ═══ FOOTER ════════════════════════════════════ */}
              <div className="px-6 pb-5 pt-0 text-center">
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Powered by{" "}
                  <span className="font-semibold text-[#2E3A59]">EduCap Payments</span>{" "}
                  · Demo Mode
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

