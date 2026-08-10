import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import LandingPricing from "../components/LandingPricing";
import heroBg from "../assets/hero_illustration.png";
import step1Img from "../assets/step1.jpg";
import step2Img from "../assets/step2.jpg";
import step3Img from "../assets/step3.jpg";

const features = [
  {
    icon: "📊",
    title: "Inflation-Aware Cost Modeling",
    desc: "Compounds tuition and living costs year-by-year using real education and general inflation rates — so you see the true cost, not today's price.",
  },
  {
    icon: "⏳",
    title: "Moratorium Trap Detector",
    desc: "Visualises exactly how much interest silently accrues during your study + grace period, revealing the true loan principal before EMI begins.",
  },
  {
    icon: "🎯",
    title: "FOIR Risk Rating",
    desc: "Computes your Fixed Obligation to Income Ratio against AI-estimated realistic starting salaries. Safe · Moderate · High Stress — in plain English.",
  },
  {
    icon: "🤖",
    title: "AI Salary Forecasting",
    desc: "Powered by Google Gemini, EduCap estimates realistic post-grad salary ranges based on your degree, institution, and city.",
  },
  {
    icon: "📈",
    title: "Interactive Visualisations",
    desc: "Amortization curves, moratorium growth charts, and FOIR gauges update in real time as you adjust sliders.",
  },
  {
    icon: "⚖️",
    title: "Plan A vs Plan B",
    desc: "Save and compare multiple loan scenarios side-by-side to find the combination that works for you.",
  },
  {
    icon: "🔗",
    title: "Shareable Report Links",
    desc: "Share your risk report via link with parents or co-signers to keep everyone on the same page.",
  },
  {
    icon: "🔔",
    title: "Rate Change Alerts",
    desc: "Get notified when your lender's interest rate changes so you can act early and refinance.",
  },
];

const stats = [
  { value: "₹25L+", label: "Average Study Abroad Loan" },
  { value: "38%", label: "Students exceed safe FOIR" },
  { value: "6–8%", label: "Annual education inflation in India" },
  { value: "2–4x", label: "True cost vs sticker price after moratorium" },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section
        style={{
          minHeight: "88vh",
          display: "flex",
          alignItems: "center",
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "80px 0 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >


        {/* Decorative SVG Doodles */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute top-32 left-[15%] pointer-events-none hidden md:block"
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="absolute top-48 right-[15%] pointer-events-none hidden md:block"
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
        </motion.div>

        <div className="container relative z-10" style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.9)",
              border: "1px solid var(--border)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              borderRadius: "999px",
              padding: "6px 16px",
              fontSize: "0.85rem",
              color: "var(--primary-light)",
              fontWeight: 500,
              marginBottom: "24px",
            }}
          >
            🚀 Student-first financial planning
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ marginBottom: "24px", color: "var(--text)" }}
          >
            Know Your Loan Reality{" "}
            <br />
            <span>Before You Sign</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              color: "var(--text)",
              fontSize: "1.15rem",
              fontWeight: 600,
              maxWidth: "620px",
              margin: "0 auto 40px",
              lineHeight: 1.7,
            }}
          >
            EduCap models your total inflated education cost, moratorium interest trap,
            and post-grad EMI burden — then rates your risk objectively so you can
            borrow smart, not blind.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{ display: "flex", gap: "16px", justifyContent: "flex-end", flexWrap: "wrap" }}
          >
            <Link to="/wizard" className="btn btn-primary btn-lg" id="hero-cta-plan">
              Calculate My Loan Risk →
            </Link>
            <Link to="/register" className="btn btn-primary btn-lg" id="hero-cta-register">
              Create Free Account
            </Link>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "flex-end",
              marginTop: "72px",
              flexWrap: "wrap",
              width: "100%",
            }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                style={{
                  padding: "16px 24px",
                  textAlign: "center",
                  background: "rgba(255, 255, 255, 0.85)",
                  borderRadius: "16px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 800,
                    fontFamily: "Outfit, sans-serif",
                    color: "var(--text)",
                  }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500, marginTop: "4px" }}>
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SVG Curve Divider */}
      <div className="w-full relative -mt-1 z-10" style={{ background: "var(--bg-card)" }}>
        <svg viewBox="0 0 1440 120" className="w-full block" preserveAspectRatio="none" style={{ background: "var(--bg)" }}>
          <path d="M0,0 C480,120 960,120 1440,0 L1440,120 L0,120 Z" fill="var(--bg-card)" />
        </svg>
      </div>

      {/* Features */}
      <section className="section" style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2>Everything you need to borrow confidently</h2>
            <p style={{ color: "var(--text-muted)", marginTop: "12px", maxWidth: "480px", margin: "12px auto 0" }}>
              Built for students, not bankers. EduCap turns complex loan math into clear, actionable signals.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                className="card h-full"
              >
                <div style={{ fontSize: "2.2rem", marginBottom: "12px" }}>{f.icon}</div>
                <h3 style={{ marginBottom: "8px", fontSize: "1.1rem" }}>{f.title}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2>Three steps to loan clarity</h2>
          </div>
          <div className="grid-3">
            {[
              { step: "01", title: "Enter your academic profile", desc: "Degree, institution, city, duration, and estimated tuition/living costs.", img: step1Img },
              { step: "02", title: "Configure your loan terms", desc: "Principal, interest rate, moratorium period, and repayment tenure.", img: step2Img },
              { step: "03", title: "Get your risk report", desc: "Instant FOIR rating, AI salary forecast, and actionable mitigation advice.", img: step3Img },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{ textAlign: "center", padding: "32px 16px" }}
              >
                <div style={{ position: "relative", marginBottom: "24px" }}>
                  <img
                    src={item.img}
                    alt={item.title}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                      borderRadius: "16px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                      display: "block"
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "-16px",
                      left: "-16px",
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                      fontWeight: 800,
                      fontFamily: "Outfit, sans-serif",
                      color: "white",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      border: "3px solid var(--bg)"
                    }}
                  >
                    {item.step}
                  </div>
                </div>
                <h3 style={{ marginBottom: "8px" }}>{item.title}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "48px" }}>
            <Link to="/wizard" className="btn btn-primary btn-lg" id="how-cta">
              Start Planning — It's Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        className="section py-20"
        id="pricing"
        style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center my-12 flex flex-col items-center justify-center">
            <h2 className="text-[36px] font-bold text-[var(--primary)] mb-6">Simple, transparent pricing</h2>
            <p className="text-[16px] text-gray-500 font-normal max-w-2xl text-center">
              Invest in your education journey. Choose the plan that fits your goals and start planning smarter today.
            </p>
          </div>
          <LandingPricing />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 pt-10 pb-16 bg-[var(--bg)] text-[13px] text-gray-500">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-row justify-between items-center w-full gap-4">
            <div className="flex-1 text-left whitespace-nowrap">
              © 2024 Edu Cap. All rights reserved.
            </div>
            
            <div className="flex-1 text-center font-bold text-gray-700 text-[14px]">
              Edu Cap
            </div>
            
            <div className="flex-1 flex justify-end gap-4 whitespace-nowrap">
              <Link to="/privacy" className="hover:text-gray-800 underline decoration-gray-300 underline-offset-2">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-gray-800 underline decoration-gray-300 underline-offset-2">Terms of Service</Link>
              <Link to="/support" className="hover:text-gray-800 underline decoration-gray-300 underline-offset-2">Contact Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
