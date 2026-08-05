export default function TermsPage() {
  return (
    <div style={{ padding: "80px 24px", minHeight: "calc(100vh - 80px)", background: "var(--bg)" }}>
      <div className="container-sm">
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ marginBottom: "16px", fontSize: "2.5rem" }}>Terms of Service</h1>
          <p style={{ color: "var(--text-muted)" }}>Last updated: August 4, 2026</p>
        </div>

        <div className="card" style={{ padding: "40px", lineHeight: "1.8" }}>
          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "16px" }}>1. Acceptance of Terms</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
              By accessing or using EduCap ("Service"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our Service.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "16px" }}>2. Financial Disclaimer</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
              EduCap provides financial estimation tools, AI-generated salary forecasts, and educational content. <strong>We are not a licensed financial advisor, bank, or lender.</strong> All calculations, risk assessments (FOIR), and AI estimates are for informational purposes only. You should always consult with a certified financial professional before signing any loan agreements.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "16px" }}>3. Subscriptions and Payments</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
              Certain features of the Service (e.g., Plus and Pro tiers) require a paid subscription. All payments are securely processed through our third-party payment provider (Razorpay). Subscriptions are billed in advance and are non-refundable unless legally required.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "16px" }}>4. Data Privacy</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
              We take the privacy of your financial data seriously. Please review our <a href="/privacy" style={{ color: "var(--primary-light)", textDecoration: "underline" }}>Privacy Policy</a> to understand how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "16px" }}>5. Limitation of Liability</h2>
            <p style={{ color: "var(--text-muted)" }}>
              EduCap and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of, or inability to access or use, the Service or any content provided by the Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
