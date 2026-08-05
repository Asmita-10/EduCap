import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  tier: "FREE" | "PLUS" | "PRO";
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  isPlus: () => boolean;
  isPro: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        set({ user, accessToken, refreshToken });
      },
      clearAuth: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({ user: null, accessToken: null, refreshToken: null });
      },
      isAuthenticated: () => !!get().user,
      isPlus: () => get().user?.tier === "PLUS" || get().user?.tier === "PRO",
      isPro: () => get().user?.tier === "PRO",
    }),
    {
      name: "educap-auth",
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, refreshToken: state.refreshToken }),
    }
  )
);

// ─── Wizard State ──────────────────────────────────────────────────────────

export interface WizardStep1Data {
  degree: string;
  institution: string;
  city: string;
  durationYears: number;
  tuitionCostPerYear: number;
  livingCostPerYear: number;
  educationInflation: number;
  generalInflation: number;
}

export interface WizardStep2Data {
  principal: number;
  interestRate: number;
  moratoriumMonths: number;
  accrualType: "SIMPLE" | "COMPOUND";
  repaymentMonths: number;
  estimatedMonthlySalary: number;
}

export interface WizardResults {
  summary: {
    totalInflatedExpense: number;
    principalAfterMoratorium: number;
    interestAccruedDuringMoratorium: number;
    emi: number;
    totalRepayment: number;
    totalInterestPaid: number;
    foir: number;
    riskBand: "SAFE" | "MODERATE" | "HIGH_STRESS";
    estimatedMonthlySalary: number;
  };
  inflatedCostBreakdown: Array<{ year: number; tuition: number; living: number; total: number }>;
  moratoriumBreakdown: Array<{ month: number; balance: number; interestThisMonth: number }>;
  amortizationSchedule: Array<{ month: number; emi: number; principal: number; interest: number; balance: number }>;
  aiReport?: {
    summary: string;
    mitigationSuggestions: string[];
    salaryForecast: { min: number; max: number; median: number };
    isAIGenerated: boolean;
  };
}

interface WizardState {
  step: number;
  step1: WizardStep1Data | null;
  step2: WizardStep2Data | null;
  results: WizardResults | null;
  planName: string;
  setStep: (step: number) => void;
  setStep1: (data: WizardStep1Data) => void;
  setStep2: (data: WizardStep2Data) => void;
  setResults: (results: WizardResults) => void;
  setPlanName: (name: string) => void;
  reset: () => void;
}

export const useWizardStore = create<WizardState>((set) => ({
  step: 1,
  step1: null,
  step2: null,
  results: null,
  planName: "",
  setStep: (step) => set({ step }),
  setStep1: (data) => set({ step1: data }),
  setStep2: (data) => set({ step2: data }),
  setResults: (results) => set({ results }),
  setPlanName: (planName) => set({ planName }),
  reset: () => set({ step: 1, step1: null, step2: null, results: null, planName: "" }),
}));
