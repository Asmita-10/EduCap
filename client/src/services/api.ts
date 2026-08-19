import axios from 'axios';

// Environment flags
const API_URL = import.meta.env.VITE_API_URL;
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

// Axios client with credentials
const realClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add Authorization header since cross-origin cookies can be blocked by some browsers
realClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper delay for mock responses
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Mock implementations (preserved) ---
function calculateMockResults(body: any) {
  const tuitionCostPerYear = Number(body.tuitionCostPerYear) || 500000;
  const livingCostPerYear = Number(body.livingCostPerYear) || 200000;
  const inflationRate = Number(body.educationInflation) || 6;
  const courseDuration = Number(body.durationYears) || 2;
  const principal = Number(body.principal) || 1000000;
  const interestRate = Number(body.interestRate) || 10.5;
  const moratoriumMonths = Number(body.moratoriumMonths) || 24;
  const accrualType = body.accrualType || "COMPOUND";
  const estimatedMonthlySalary = Number(body.estimatedMonthlySalary) || 120000;
  const repaymentMonths = Number(body.repaymentMonths) || 120;

  const inflatedCostBreakdown = [];
  let totalInflatedExpense = 0;
  for (let year = 1; year <= courseDuration; year++) {
    const tuition = tuitionCostPerYear * Math.pow(1 + inflationRate / 100, year - 1);
    const living = livingCostPerYear * Math.pow(1 + inflationRate / 100, year - 1);
    const total = tuition + living;
    inflatedCostBreakdown.push({ year, tuition, living, total });
    totalInflatedExpense += total;
  }

  const moratoriumBreakdown = [];
  let currentBalance = principal;
  const monthlyRate = (interestRate / 100) / 12;

  if (moratoriumMonths > 0 && monthlyRate > 0) {
    if (accrualType === "COMPOUND") {
      for (let month = 1; month <= moratoriumMonths; month++) {
        const interestThisMonth = currentBalance * monthlyRate;
        currentBalance += interestThisMonth;
        moratoriumBreakdown.push({ month, balance: currentBalance, interestThisMonth });
      }
    } else {
      for (let month = 1; month <= moratoriumMonths; month++) {
        const interestThisMonth = principal * monthlyRate;
        currentBalance += interestThisMonth;
        moratoriumBreakdown.push({ month, balance: currentBalance, interestThisMonth });
      }
    }
  }

  const interestAccruedDuringMoratorium = currentBalance - principal;

  // Amortization Schedule
  const amortizationSchedule = [];
  let balance = currentBalance;
  let emi = 0;
  if (repaymentMonths > 0 && balance > 0) {
    if (monthlyRate > 0) {
      emi = (balance * monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths)) /
        (Math.pow(1 + monthlyRate, repaymentMonths) - 1);
    } else {
      emi = balance / repaymentMonths;
    }
  }
  let totalInterestPaidDuringRepayment = 0;
  for (let month = 1; month <= repaymentMonths; month++) {
    const interest = balance * monthlyRate;
    let principalPaid = emi - interest;
    if (principalPaid > balance) principalPaid = balance;
    balance -= principalPaid;
    totalInterestPaidDuringRepayment += interest;
    amortizationSchedule.push({ month, emi, principal: principalPaid, interest, balance: Math.max(0, balance) });
  }

  const totalRepayment = emi * repaymentMonths;
  const totalInterestPaid = interestAccruedDuringMoratorium + totalInterestPaidDuringRepayment;
  const foir = estimatedMonthlySalary > 0 ? (emi / estimatedMonthlySalary) * 100 : 0;
  let riskBand = "SAFE";
  if (foir > 45) riskBand = "HIGH_STRESS";
  else if (foir >= 30) riskBand = "MODERATE";

  return {
    summary: {
      totalInflatedExpense,
      principalAfterMoratorium: currentBalance,
      interestAccruedDuringMoratorium,
      emi,
      totalRepayment,
      totalInterestPaid,
      foir,
      riskBand,
      estimatedMonthlySalary,
    },
    inflatedCostBreakdown,
    moratoriumBreakdown,
    amortizationSchedule,
    aiReport: {
      summary: `Based on risk diagnostics, your education loan profile is in the ${riskBand.toLowerCase()} risk band with a monthly repayment ratio of ${foir.toFixed(1)}%.`,
      mitigationSuggestions: [
        "Review whether refinancing can lower your interest rate below the current market rate.",
        "Ensure post-graduation starting salaries align with the estimated median salary."
      ],
      salaryForecast: { min: estimatedMonthlySalary * 0.8, max: estimatedMonthlySalary * 1.5, median: estimatedMonthlySalary },
      isAIGenerated: true,
    },
  };
}

function calculateMockRiskReport(results: any) {
  return {
    foirPercent: results.summary.foir,
    riskBand: results.summary.riskBand,
    aiSummary: results.aiReport.summary,
    mitigationSuggestions: JSON.stringify(results.aiReport.mitigationSuggestions),
    salaryRangeMin: results.aiReport.salaryForecast.min,
    salaryRangeMax: results.aiReport.salaryForecast.max,
  };
}

// Simple mock API client matching the previous interface
const mockApi = {
  get: async (url: string, config: any = {}): Promise<any> => {
    await delay(300);
    if (url === "/api/subscriptions/me") {
      const saved = localStorage.getItem("educap_subscription");
      const sub = saved ? JSON.parse(saved) : { tier: "FREE", status: "EXPIRED" };
      return { data: sub };
    }
    if (url === "/api/plans") {
      const saved = localStorage.getItem("educap_plans");
      const plans = saved ? JSON.parse(saved) : [];
      return { data: { plans } };
    }
    if (url.includes("/export")) {
      if (config.responseType === "blob") {
        const dummyPdf = "%PDF-1.4 Mock PDF Content";
        const blob = new Blob([dummyPdf], { type: "application/pdf" });
        return { data: blob };
      }
    }
    throw new Error(`Mock 404: Route ${url} not found`);
  },
  post: async (url: string, body: any = {}): Promise<any> => {
    await delay(300);
    if (url === "/api/calculate") {
      const computed = calculateMockResults(body);
      return { data: computed };
    }
    if (url === "/api/auth/register" || url === "/api/auth/login") {
      const { email } = body;
      const saved = localStorage.getItem("educap_subscription");
      const sub = saved ? JSON.parse(saved) : { status: "EXPIRED", tier: "FREE" };
      const tier = sub.status === "ACTIVE" ? sub.tier : "FREE";
      const mockUser = { id: "usr_mock_123", email, tier };
      localStorage.setItem("accessToken", "mock_access_token_jwt");
      localStorage.setItem("refreshToken", "mock_refresh_token_jwt");
      localStorage.setItem("educap_user", JSON.stringify(mockUser));
      return { data: { user: mockUser, accessToken: "mock_access_token_jwt", refreshToken: "mock_refresh_token_jwt" } };
    }
    if (url === "/api/subscriptions/confirm-payment") {
      const { tier } = body;
      const end = new Date();
      end.setDate(end.getDate() + 30);
      const newSub = { status: "ACTIVE", tier: tier || "PLUS", currentPeriodEnd: end.toISOString(), cancelAtPeriodEnd: false };
      localStorage.setItem("educap_subscription", JSON.stringify(newSub));
      const userStr = localStorage.getItem("educap_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        user.tier = tier;
        localStorage.setItem("educap_user", JSON.stringify(user));
      }
      return { data: { success: true } };
    }
    if (url === "/api/subscriptions/cancel") {
      const saved = localStorage.getItem("educap_subscription");
      if (saved) {
        const sub = JSON.parse(saved);
        sub.cancelAtPeriodEnd = true;
        localStorage.setItem("educap_subscription", JSON.stringify(sub));
      }
      return { data: { success: true } };
    }
    if (url === "/api/plans") {
      const saved = localStorage.getItem("educap_plans");
      const plans = saved ? JSON.parse(saved) : [];
      const computed = calculateMockResults(body);
      const risk = calculateMockRiskReport(computed);
      const newPlan = {
        id: "plan_" + Math.random().toString(36).substring(2, 11),
        name: body.name || "Default Plan",
        ...body,
        createdAt: new Date().toISOString(),
        computedResults: computed,
        riskReport: risk,
      };
      plans.unshift(newPlan);
      localStorage.setItem("educap_plans", JSON.stringify(plans));
      return { data: { success: true, plan: newPlan } };
    }
    throw new Error(`Mock 404: Route ${url} not found`);
  },
  delete: async (url: string): Promise<any> => {
    await delay(300);
    if (url.startsWith("/api/plans/")) {
      const id = url.split("/").pop();
      const saved = localStorage.getItem("educap_plans");
      const plans = saved ? JSON.parse(saved) : [];
      const filtered = plans.filter((p: any) => p.id !== id);
      localStorage.setItem("educap_plans", JSON.stringify(filtered));
      return { data: { success: true } };
    }
    throw new Error(`Mock 404: Route ${url} not found`);
  },
};

// Exported API wrapper
const api = {
  get: (url: string, config: any = {}) => {
    if (USE_MOCK_API) return mockApi.get(url, config);
    return realClient.get(url, config);
  },
  post: (url: string, body: any = {}) => {
    if (USE_MOCK_API) return mockApi.post(url, body);
    return realClient.post(url, body);
  },
  delete: (url: string) => {
    if (USE_MOCK_API) return mockApi.delete(url);
    return realClient.delete(url);
  },
};

export default api;
