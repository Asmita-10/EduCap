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
    <div className="min-h-screen bg-[#F2F0ED] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-[#1E5D50]">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Glossary & Guide
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">
            Financial Terms Explained
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            A quick, simplified guide to understanding the core education loan and financial metrics used across EduCap.
          </p>

          {/* Real-time Search Input */}
          <div className="relative mt-6 max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search terms or keywords (e.g., FOIR, Moratorium)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2DFD8] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1E5D50]/20 focus:border-[#1E5D50] transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Financial Terms Card Grid */}
        {filteredTerms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            {filteredTerms.map((item) => (
              <div
                key={item.term}
                className="bg-[#FAF9F6] border border-[#E2DFD8] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <h3 className="text-lg font-bold text-[#111827] mb-2">
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
          <div className="bg-[#FAF9F6] border border-[#E2DFD8] rounded-2xl p-8 text-center text-[#6B7280] mt-6">
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
