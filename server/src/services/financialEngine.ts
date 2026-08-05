// Core Financial Computation Engine
// All formulas are pure functions with deterministic, precise output.
// Unit-tested to guarantee correctness within 2 decimal places (FR-6).

export type AccrualType = "SIMPLE" | "COMPOUND";

export type RiskBand = "SAFE" | "MODERATE" | "HIGH_STRESS";

export interface InflatedCostResult {
  totalInflatedTuition: number;
  totalInflatedLiving: number;
  totalInflatedExpense: number;
  yearlyBreakdown: Array<{
    year: number;
    tuition: number;
    living: number;
    total: number;
  }>;
}

export interface MoratoriumResult {
  principalAfterMoratorium: number;
  interestAccruedDuringMoratorium: number;
  monthlyBreakdown: Array<{
    month: number;
    balance: number;
    interestThisMonth: number;
  }>;
}

export interface AmortizationEntry {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface ComputedResults {
  inflatedCost: InflatedCostResult;
  moratorium: MoratoriumResult;
  emi: number;
  totalRepayment: number;
  totalInterestPaid: number;
  amortizationSchedule: AmortizationEntry[];
  foir: number;
  riskBand: RiskBand;
  estimatedMonthlySalary: number;
}

/**
 * FR-1: Compute total inflated educational expense over study duration.
 * Tuition inflates at i_edu per year; living costs at i_inf per year.
 */
export function computeInflatedCost(
  tuitionPerYear: number,
  livingPerYear: number,
  durationYears: number,
  educationInflationPct: number,
  generalInflationPct: number
): InflatedCostResult {
  const i_edu = educationInflationPct / 100;
  const i_inf = generalInflationPct / 100;

  let totalInflatedTuition = 0;
  let totalInflatedLiving = 0;
  const yearlyBreakdown: InflatedCostResult["yearlyBreakdown"] = [];

  for (let n = 1; n <= durationYears; n++) {
    const tuition = round2(tuitionPerYear * Math.pow(1 + i_edu, n - 1));
    const living = round2(livingPerYear * Math.pow(1 + i_inf, n - 1));
    totalInflatedTuition += tuition;
    totalInflatedLiving += living;
    yearlyBreakdown.push({ year: n, tuition, living, total: round2(tuition + living) });
  }

  return {
    totalInflatedTuition: round2(totalInflatedTuition),
    totalInflatedLiving: round2(totalInflatedLiving),
    totalInflatedExpense: round2(totalInflatedTuition + totalInflatedLiving),
    yearlyBreakdown,
  };
}

/**
 * FR-2: Compute moratorium balance — interest accrued during study period
 * + grace period before EMI begins.
 * Supports SIMPLE and COMPOUND accrual (user-selectable).
 */
export function computeMoratoriumBalance(
  loanPrincipal: number,
  annualInterestRatePct: number,
  moratoriumMonths: number,
  accrualType: AccrualType
): MoratoriumResult {
  const monthlyRate = annualInterestRatePct / 100 / 12;
  const monthlyBreakdown: MoratoriumResult["monthlyBreakdown"] = [];

  if (accrualType === "SIMPLE") {
    const totalInterest = round2(loanPrincipal * monthlyRate * moratoriumMonths);
    const principalAfterMoratorium = round2(loanPrincipal + totalInterest);
    const interestPerMonth = round2(totalInterest / (moratoriumMonths || 1));

    for (let m = 1; m <= moratoriumMonths; m++) {
      monthlyBreakdown.push({
        month: m,
        balance: round2(loanPrincipal + interestPerMonth * m),
        interestThisMonth: interestPerMonth,
      });
    }

    return {
      principalAfterMoratorium,
      interestAccruedDuringMoratorium: totalInterest,
      monthlyBreakdown,
    };
  } else {
    // COMPOUND
    let balance = loanPrincipal;
    for (let m = 1; m <= moratoriumMonths; m++) {
      const interestThisMonth = round2(balance * monthlyRate);
      balance = round2(balance + interestThisMonth);
      monthlyBreakdown.push({ month: m, balance, interestThisMonth });
    }

    return {
      principalAfterMoratorium: round2(balance),
      interestAccruedDuringMoratorium: round2(balance - loanPrincipal),
      monthlyBreakdown,
    };
  }
}

/**
 * FR-3: Compute EMI using standard reducing-balance formula.
 * EMI = P × r(1+r)^n / ((1+r)^n - 1)
 */
export function computeEMI(
  principal: number,
  annualInterestRatePct: number,
  repaymentMonths: number
): number {
  if (repaymentMonths === 0) return 0;
  const r = annualInterestRatePct / 100 / 12;
  if (r === 0) return round2(principal / repaymentMonths);
  const emi = (principal * r * Math.pow(1 + r, repaymentMonths)) /
    (Math.pow(1 + r, repaymentMonths) - 1);
  return round2(emi);
}

/**
 * Generate full amortization schedule.
 */
export function computeAmortizationSchedule(
  principal: number,
  annualInterestRatePct: number,
  repaymentMonths: number
): { schedule: AmortizationEntry[]; totalRepayment: number; totalInterestPaid: number } {
  const r = annualInterestRatePct / 100 / 12;
  const emi = computeEMI(principal, annualInterestRatePct, repaymentMonths);
  let balance = principal;
  const schedule: AmortizationEntry[] = [];

  for (let m = 1; m <= repaymentMonths; m++) {
    const interestComponent = round2(balance * r);
    const principalComponent = round2(Math.min(emi - interestComponent, balance));
    balance = round2(balance - principalComponent);
    if (balance < 0) balance = 0;
    schedule.push({
      month: m,
      emi: round2(emi),
      principal: principalComponent,
      interest: interestComponent,
      balance,
    });
  }

  const totalRepayment = round2(emi * repaymentMonths);
  const totalInterestPaid = round2(totalRepayment - principal);

  return { schedule, totalRepayment, totalInterestPaid };
}

/**
 * FR-4: Compute FOIR (Fixed Obligation to Income Ratio).
 */
export function computeFOIR(monthlyEMI: number, estimatedMonthlyNetSalary: number): number {
  if (estimatedMonthlyNetSalary === 0) return 100;
  return round2((monthlyEMI / estimatedMonthlyNetSalary) * 100);
}

/**
 * FR-5: Classify FOIR into risk bands.
 * Safe ≤ 30%, Moderate 30–45%, High Stress > 45%
 */
export function classifyRisk(foirPct: number): RiskBand {
  if (foirPct <= 30) return "SAFE";
  if (foirPct <= 45) return "MODERATE";
  return "HIGH_STRESS";
}

/**
 * Master computation function — runs all steps and returns complete results.
 */
export function runFullComputation(params: {
  tuitionCostPerYear: number;
  livingCostPerYear: number;
  durationYears: number;
  educationInflation: number;
  generalInflation: number;
  principal: number;
  interestRate: number;
  moratoriumMonths: number;
  accrualType: AccrualType;
  repaymentMonths: number;
  estimatedMonthlySalary: number;
}): ComputedResults {
  const inflatedCost = computeInflatedCost(
    params.tuitionCostPerYear,
    params.livingCostPerYear,
    params.durationYears,
    params.educationInflation,
    params.generalInflation
  );

  const moratorium = computeMoratoriumBalance(
    params.principal,
    params.interestRate,
    params.moratoriumMonths,
    params.accrualType
  );

  const { schedule, totalRepayment, totalInterestPaid } = computeAmortizationSchedule(
    moratorium.principalAfterMoratorium,
    params.interestRate,
    params.repaymentMonths
  );

  const emi = schedule.length > 0 ? schedule[0].emi : 0;
  const foir = computeFOIR(emi, params.estimatedMonthlySalary);
  const riskBand = classifyRisk(foir);

  return {
    inflatedCost,
    moratorium,
    emi,
    totalRepayment,
    totalInterestPaid,
    amortizationSchedule: schedule,
    foir,
    riskBand,
    estimatedMonthlySalary: params.estimatedMonthlySalary,
  };
}

/** Round to 2 decimal places (avoids floating-point drift, FR-6) */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
