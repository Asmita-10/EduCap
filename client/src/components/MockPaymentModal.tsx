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

/* ── shared style tokens ─────────────────────────────────── */
const radius = "rounded-lg";       // 8 px everywhere
const inputBase =
  `w-full border bg-white ${radius} px-4 h-11 text-sm text-gray-800
   placeholder:text-gray-400
   focus:outline-none focus:ring-2 focus:ring-[#4A9D8E]/25 focus:border-[#4A9D8E]
   transition-all duration-150`;

export default function MockPaymentModal({
  isOpen, tier, amount, onSuccess, onDismiss,
}: MockPaymentModalProps) {

  const [step, setStep]           = useState<Step>("form");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry]       = useState("");
  const [cvv, setCvv]             = useState("");
  const [name, setName]           = useState("");
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const rupees = (amount / 100).toFixed(0);

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
    if (!name.trim())                          e.name   = "Cardholder name is required";
    if (cardNumber.replace(/\s/g, "").length !== 16) e.card   = "Enter a valid 16-digit card number";
    if (!/^\d{2}\/\d{2}$/.test(expiry))        e.expiry = "Enter expiry as MM/YY";
    if (cvv.length < 3)                        e.cvv    = "Enter a valid CVV";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── mock pay ────────────────────────────────────────────── */
  const handlePay = async () => {
    if (!validate()) return;
    setStep("processing");
    await new Promise(r => setTimeout(r, 2000));
    const pid  = "pay_mock_" + Math.random().toString(36).substring(2, 14).toUpperCase();
    const sid  = "sub_mock_" + Math.random().toString(36).substring(2, 14).toUpperCase();
    const sig  = Array.from({ length: 64 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
    setStep("success");
    await new Promise(r => setTimeout(r, 1200));
    onSuccess(pid, sid, sig);
  };

  const handleClose = () => {
    if (step === "processing") return;
    setStep("form"); setCardNumber(""); setExpiry(""); setCvv(""); setName(""); setErrors({});
    onDismiss();
  };

  /* ── label helper ────────────────────────────────────────── */
  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-400 mb-1.5 select-none">
      {children}
    </label>
  );

  /* ── border helper ───────────────────────────────────────── */
  const bdr = (field: string) => errors[field] ? "border-red-400" : "border-gray-200";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/50 backdrop-blur-[6px] z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={step !== "processing" ? handleClose : undefined}
          />

          {/* modal centering wrapper */}
          <motion.div
            key="modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <div className={`bg-white ${radius} shadow-2xl w-full max-w-[420px] overflow-hidden`}>

              {/* ═══ HEADER ═══════════════════════════════════ */}
              <div className="bg-[#2E3A59] px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm tracking-wide">EC</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-[15px] leading-tight">EduCap</p>
                    <p className="text-white/50 text-[12px] leading-tight mt-0.5">{tier} Plan Subscription</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={step === "processing"}
                  className="w-8 h-8 flex items-center justify-center rounded-md
                             text-white/50 hover:text-white hover:bg-white/10
                             transition-colors disabled:opacity-20 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <X className="w-[18px] h-[18px]" />
                </button>
              </div>

              {/* ═══ AMOUNT BANNER ════════════════════════════ */}
              <div className="bg-[#4A9D8E]/8 border-b border-[#4A9D8E]/15 px-5 py-3 flex items-baseline justify-between">
                <span className="text-[13px] text-gray-500">Amount to pay</span>
                <span className="text-[20px] font-bold text-[#2E3A59] leading-none">
                  ₹{rupees}
                  <span className="text-[13px] font-normal text-gray-400 ml-0.5">/mo</span>
                </span>
              </div>

              {/* ═══ BODY ═════════════════════════════════════ */}
              <div className="px-5 py-5">

                {/* ── FORM STEP ──────────────────────────────── */}
                {step === "form" && (
                  <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

                    {/* payment method tabs */}
                    <div className="flex gap-2 mb-5">
                      {[
                        { label: "Card", icon: <CreditCard className="w-4 h-4" />, active: true  },
                        { label: "UPI",  icon: null,                                active: false },
                        { label: "Net Banking", icon: null,                         active: false },
                      ].map(t => (
                        <button
                          key={t.label}
                          disabled={!t.active}
                          className={`flex items-center justify-center gap-2 px-4 h-9 ${radius} text-[13px] font-medium
                            transition-all duration-150 select-none
                            ${t.active
                              ? "bg-[#4A9D8E]/10 border border-[#4A9D8E] text-[#4A9D8E]"
                              : "border border-gray-200 text-gray-350 cursor-not-allowed opacity-50"
                            }`}
                        >
                          {t.icon}{t.label}
                        </button>
                      ))}
                    </div>

                    {/* fields */}
                    <div className="flex flex-col gap-5">

                      {/* cardholder name */}
                      <div>
                        <Label>Cardholder Name</Label>
                        <input
                          type="text" value={name} onChange={e => setName(e.target.value)}
                          placeholder="Name on card"
                          className={`${inputBase} ${bdr("name")}`}
                        />
                        {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
                      </div>

                      {/* card number */}
                      <div>
                        <Label>Card Number</Label>
                        <div className="relative">
                          <input
                            type="text" value={cardNumber}
                            onChange={e => setCardNumber(fmtCard(e.target.value))}
                            placeholder="4111 1111 1111 1111"
                            className={`${inputBase} pr-11 font-mono tracking-widest ${bdr("card")}`}
                          />
                          <CreditCard className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-300 pointer-events-none" />
                        </div>
                        {errors.card && <p className="text-[11px] text-red-500 mt-1">{errors.card}</p>}
                      </div>

                      {/* expiry + cvv  (50/50 split, 16 px gap) */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Expiry</Label>
                          <input
                            type="text" value={expiry}
                            onChange={e => setExpiry(fmtExp(e.target.value))}
                            placeholder="MM/YY"
                            className={`${inputBase} font-mono ${bdr("expiry")}`}
                          />
                          {errors.expiry && <p className="text-[11px] text-red-500 mt-1">{errors.expiry}</p>}
                        </div>
                        <div>
                          <Label>CVV</Label>
                          <input
                            type="password" value={cvv}
                            onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            placeholder="•••"
                            className={`${inputBase} font-mono text-center ${bdr("cvv")}`}
                          />
                          {errors.cvv && <p className="text-[11px] text-red-500 mt-1">{errors.cvv}</p>}
                        </div>
                      </div>
                    </div>

                    {/* pay button */}
                    <button
                      onClick={handlePay}
                      className={`w-full mt-6 bg-[#4A9D8E] hover:bg-[#3d8678] active:bg-[#357a6d]
                        text-white font-semibold h-12 ${radius}
                        transition-colors duration-150
                        flex items-center justify-center gap-2 text-[14px]`}
                    >
                      <Lock className="w-4 h-4" />
                      Pay ₹{rupees} Securely
                    </button>

                    {/* trust badges */}
                    <div className="flex items-center justify-center gap-5 mt-3">
                      <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <ShieldCheck className="w-3.5 h-3.5" />256-bit SSL
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <Lock className="w-3.5 h-3.5" />PCI DSS Secure
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* ── PROCESSING STEP ────────────────────────── */}
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

                {/* ── SUCCESS STEP ────────────────────────────── */}
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

              {/* ═══ FOOTER ═══════════════════════════════════ */}
              <div className="px-5 pb-4 pt-0 text-center">
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
