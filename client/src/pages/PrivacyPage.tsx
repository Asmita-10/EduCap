export default function PrivacyPage() {
  return (
    <div style={{ padding: "80px 24px", minHeight: "calc(100vh - 80px)", background: "var(--bg)" }}>
      <div className="container-sm">
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ marginBottom: "16px", fontSize: "2.5rem" }}>Privacy Policy</h1>
          <p style={{ color: "var(--text-muted)" }}>Last updated: August 4, 2026</p>
        </div>

        <div className="card" style={{ padding: "40px", lineHeight: "1.8" }}>
          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "16px" }}>1. Information We Collect</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
              We collect information you provide directly to us when you create an account, such as your email address and password. When you use the EduCap loan wizard, we collect the financial data you input (such as principal amounts, interest rates, and academic details) to generate your loan plans and risk reports.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "16px" }}>2. How We Use Your Information</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
              We use the collected information to:
            </p>
            <ul style={{ color: "var(--text-muted)", paddingLeft: "24px", marginBottom: "16px" }}>
              <li>Provide, maintain, and improve our Service;</li>
              <li>Generate accurate loan amortization schedules and AI-based salary forecasts;</li>
              <li>Process your transactions and send related information (e.g., confirmations);</li>
              <li>Provide customer support and respond to your requests.</li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "16px" }}>3. Data Storage and Security</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
              Your financial data and saved plans are securely stored in our databases. We use industry-standard encryption and security measures to protect your personal information. Payment details are never stored on our servers; they are processed securely by Razorpay.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "16px" }}>4. Third-Party Sharing</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
              We do not sell your personal data to third parties. We may share anonymous or aggregated data with third parties (such as Google Gemini for AI salary forecasting) to provide specific features of our Service.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "16px" }}>5. Contact Us</h2>
            <p style={{ color: "var(--text-muted)" }}>
              If you have any questions about this Privacy Policy or your data, please contact us at privacy@educap.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
