import { useState } from "react";
import { Search, BookOpen, HelpCircle } from "lucide-react";

interface FinancialTerm {
  term: string;
  ans: string;
}

const financialTerms: FinancialTerm[] = [
  {
    term: "Moratorium Period",
    ans: "An official 'payment holiday' granted while you study, during which you don't have to pay full EMIs.",
  },
  {
    term: "Compounding Interest during Moratorium",
    ans: "Interest charged on top of unpaid accrued interest before your official repayment starts.",
  },
  {
    term: "FOIR (Fixed Obligation to Income Ratio)",
    ans: "The percentage of your monthly salary that goes strictly toward paying debts and fixed bills.",
  },
  {
    term: "Amortization Schedule",
    ans: "A complete table showing how every single monthly payment is split between paying off interest vs. paying down your actual loan principal.",
  },
  {
    term: "Floating vs. Fixed Interest Rate",
    ans: "A fixed rate stays the same throughout your loan, while a floating rate moves up or down based on central bank (RBI) benchmark rates.",
  },
  {
    term: "Subsidized vs. Unsubsidized Interest",
    ans: "On subsidized loans, the government pays your interest while you are in school; on unsubsidized loans, you are responsible for all accrued interest.",
  },
  {
    term: "Prepayment Penalty & Foreclosure",
    ans: "Extra fees charged by banks if you try to pay off your entire loan early ahead of the schedule.",
  },
  {
    term: "Processing Fee & Capitalization",
    ans: "The upfront administrative charge for approving a loan, which is often added directly into your total loan balance instead of paid out-of-pocket.",
  },
  {
    term: "Collateral & Margin Money",
    ans: "Collateral is property pledged as security for a loan; margin money is the portion of total education costs you must pay out of your own pocket.",
  },
  {
    term: "Grace Period vs. Repayment Tenure",
    ans: "The grace period is the short buffer time right after graduation before EMIs begin; repayment tenure is the total length of time (e.g., 10 or 15 years) you have to pay back the full loan.",
  },
];

export default function FinancialTermsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTerms = financialTerms.filter(
    (item) =>
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ans.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F2F0ED] font-sans overflow-x-hidden">
      {/* Centered Main Container */}
      <div
        className="w-full box-border"
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "40px 24px",
        }}
      >
        {/* Header Section */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-[#1E5D50]">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Glossary & Guide
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight"
            style={{ marginBottom: "8px" }}
          >
            Financial Terms Explained
          </h1>

          <p
            className="text-sm sm:text-base leading-relaxed"
            style={{ marginBottom: "28px", color: "#555555" }}
          >
            A quick, simplified guide to understanding the core education loan and financial metrics used across EduCap.
          </p>

          {/* Search Input Bar */}
          <div
            className="relative my-6 box-border"
            style={{
              width: "100%",
              maxWidth: "500px",
            }}
          >
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "#6B7280" }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search terms or keywords (e.g., FOIR, Moratorium)..."
              className="w-full bg-white text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1E5D50]/20 focus:border-[#1E5D50] transition-all shadow-sm box-border"
              style={{
                width: "100%",
                padding: "12px 16px 12px 42px",
                borderRadius: "12px",
                border: "1.5px solid #E0E0E0",
                fontSize: "0.95rem",
              }}
            />
          </div>
        </div>

        {/* 2-Column Dynamic Grid Layout */}
        {filteredTerms.length > 0 ? (
          <div
            className="w-full box-border"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 480px), 1fr))",
              gap: "20px",
            }}
          >
            {filteredTerms.map((item) => (
              <div
                key={item.term}
                className="bg-[#FAF9F6] border border-[#E2DFD8] rounded-2xl transition-all duration-200 group box-border hover:border-[#1E5D50]/40"
                style={{
                  padding: "20px 24px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.04)";
                }}
              >
                <h3
                  className="text-lg text-[#111827] mb-2 tracking-tight group-hover:text-[#1E5D50] transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  {item.term}
                </h3>
                <p className="text-sm text-[#4B5563] leading-relaxed">
                  <span className="font-bold text-[#1E5D50] mr-1">ans:</span>{" "}
                  {item.ans}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full bg-[#FAF9F6] border border-[#E2DFD8] rounded-2xl p-8 text-center text-[#6B7280] mt-4 shadow-sm">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 text-[#9CA3AF]" />
            <p className="text-base font-semibold text-[#111827]">
              No financial terms match your search.
            </p>
            <p className="text-sm mt-1">
              Try searching for terms like "Moratorium", "FOIR", or "Interest".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
