import { GoogleGenerativeAI } from "@google/generative-ai";

export interface SalaryForecast {
  min: number;
  max: number;
  median: number;
  currency: string;
}

export interface AIRiskReport {
  salaryForecast: SalaryForecast;
  summary: string;
  mitigationSuggestions: string[];
  isAIGenerated: boolean;
}

// Rule-based salary fallback table (INR/month) keyed by degree category
const SALARY_FALLBACK: Record<string, SalaryForecast> = {
  engineering: { min: 40000, max: 120000, median: 70000, currency: "INR" },
  medicine: { min: 50000, max: 150000, median: 90000, currency: "INR" },
  mba: { min: 60000, max: 200000, median: 100000, currency: "INR" },
  law: { min: 35000, max: 100000, median: 55000, currency: "INR" },
  arts: { min: 25000, max: 70000, median: 40000, currency: "INR" },
  science: { min: 30000, max: 80000, median: 50000, currency: "INR" },
  design: { min: 30000, max: 90000, median: 55000, currency: "INR" },
  default: { min: 30000, max: 80000, median: 50000, currency: "INR" },
};

function getSalaryCategory(degree: string): string {
  const d = degree.toLowerCase();
  if (d.includes("engineer") || d.includes("b.tech") || d.includes("btech") || d.includes("computer"))
    return "engineering";
  if (d.includes("medicine") || d.includes("mbbs") || d.includes("medical")) return "medicine";
  if (d.includes("mba") || d.includes("management") || d.includes("business")) return "mba";
  if (d.includes("law") || d.includes("llb") || d.includes("llm")) return "law";
  if (d.includes("art") || d.includes("humanities") || d.includes("history")) return "arts";
  if (d.includes("science") || d.includes("b.sc") || d.includes("bsc")) return "science";
  if (d.includes("design") || d.includes("architecture")) return "design";
  return "default";
}

function buildRuleBasedMitigation(foirPct: number, riskBand: string): string[] {
  const suggestions: string[] = [];
  if (riskBand === "SAFE") {
    suggestions.push("Your repayment burden is manageable — consider making prepayments to reduce total interest paid.");
    suggestions.push("Build an emergency fund covering 6 months of EMI before graduation.");
    suggestions.push("Explore employer loan assistance benefits (many IT companies offer these).");
  } else if (riskBand === "MODERATE") {
    suggestions.push("Consider extending your repayment tenure by 2–3 years to reduce monthly EMI pressure.");
    suggestions.push("Look for part-time or internship income during your study period to reduce the loan principal.");
    suggestions.push("Negotiate a lower interest rate — a 0.5% reduction can save lakhs over 10 years.");
    suggestions.push("Target cities or companies with higher starting salary packages in your discipline.");
  } else {
    suggestions.push("⚠️ Your EMI is projected to consume over 45% of take-home salary — this is financially dangerous.");
    suggestions.push("Strongly consider reducing the loan principal by applying for scholarships, fellowships, or part-time work.");
    suggestions.push("Explore lower-cost institutions offering comparable degrees — cost difference may be 30–60%.");
    suggestions.push("Consider a longer repayment tenure (15–20 years) to reduce monthly obligation.");
    suggestions.push("Seek co-borrower support from a working parent to negotiate better loan terms.");
    suggestions.push("Delay enrollment by 1 year to build savings and reduce the borrowing amount.");
  }
  return suggestions;
}

export async function generateAIRiskReport(params: {
  degree: string;
  institution: string;
  city: string;
  foirPercent: number;
  riskBand: string;
  emi: number;
}): Promise<AIRiskReport> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return buildFallbackReport(params);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a financial advisor specializing in student education loans in India.
    
A student is planning to pursue: ${params.degree} at ${params.institution}, ${params.city}.

Their computed loan metrics:
- Monthly EMI: ₹${params.emi.toLocaleString("en-IN")}
- FOIR (EMI-to-Income Ratio): ${params.foirPercent}%
- Risk Band: ${params.riskBand}

Please provide a JSON response with EXACTLY this structure (no markdown, raw JSON only):
{
  "salaryForecast": {
    "min": <integer INR/month>,
    "max": <integer INR/month>,
    "median": <integer INR/month>,
    "currency": "INR"
  },
  "summary": "<2-3 sentence plain-English risk assessment for a non-financial reader>",
  "mitigationSuggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>", "<suggestion 4>"]
}

Base salary estimates on realistic Indian job market data for fresh graduates from the given institution/city. Be specific and practical. Keep suggestions actionable and targeted to this student's situation.`;

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AI_TIMEOUT")), 15000)
      ),
    ]);

    const text = (result as Awaited<ReturnType<typeof model.generateContent>>)
      .response.text()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(text);

    return {
      salaryForecast: parsed.salaryForecast,
      summary: parsed.summary,
      mitigationSuggestions: parsed.mitigationSuggestions,
      isAIGenerated: true,
    };
  } catch (err) {
    console.warn("[aiService] AI generation failed, using fallback:", (err as Error).message);
    return buildFallbackReport(params);
  }
}

function buildFallbackReport(params: {
  degree: string;
  institution: string;
  city: string;
  foirPercent: number;
  riskBand: string;
  emi: number;
}): AIRiskReport {
  const category = getSalaryCategory(params.degree);
  const salaryForecast = SALARY_FALLBACK[category];

  const summaryMap: Record<string, string> = {
    SAFE: `Based on typical salary ranges for ${params.degree} graduates in ${params.city}, your projected EMI of ₹${params.emi.toLocaleString("en-IN")}/month represents a manageable ${params.foirPercent}% of your expected income. This is within the safe zone (≤30%) and indicates a financially sound loan plan. You should be able to repay comfortably while maintaining a good quality of life.`,
    MODERATE: `Your projected EMI of ₹${params.emi.toLocaleString("en-IN")}/month will consume approximately ${params.foirPercent}% of your expected take-home income — placing you in the moderate risk zone (30–45%). While repayment is feasible, you will have limited financial flexibility for savings and emergencies. Consider steps to reduce your EMI burden before committing.`,
    HIGH_STRESS: `Your projected EMI of ₹${params.emi.toLocaleString("en-IN")}/month is expected to consume ${params.foirPercent}% of your likely take-home salary — well above the safe threshold of 30%. This is a high-stress financial position that could significantly impact your quality of life post-graduation. We strongly recommend restructuring your loan before proceeding.`,
  };

  return {
    salaryForecast,
    summary: summaryMap[params.riskBand] || summaryMap["MODERATE"],
    mitigationSuggestions: buildRuleBasedMitigation(params.foirPercent, params.riskBand),
    isAIGenerated: false,
  };
}
