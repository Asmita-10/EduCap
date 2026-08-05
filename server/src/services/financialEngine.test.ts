import {
  computeInflatedCost,
  computeMoratoriumBalance,
  computeEMI,
  computeFOIR,
  classifyRisk,
  runFullComputation,
} from "../services/financialEngine";

describe("Financial Computation Engine", () => {
  // --- Inflated Cost ---
  describe("computeInflatedCost", () => {
    it("should compute zero inflation correctly (no compounding)", () => {
      const result = computeInflatedCost(500000, 300000, 2, 0, 0);
      expect(result.totalInflatedTuition).toBe(1000000);
      expect(result.totalInflatedLiving).toBe(600000);
      expect(result.totalInflatedExpense).toBe(1600000);
    });

    it("should compound tuition at 8% and living at 6% over 3 years", () => {
      const result = computeInflatedCost(500000, 300000, 3, 8, 6);
      // Year 1: 500000 * 1.08^0 = 500000, Year 2: 540000, Year 3: 583200
      expect(result.totalInflatedTuition).toBe(1623200);
      // Year 1: 300000, Year 2: 318000, Year 3: 337080
      expect(result.totalInflatedLiving).toBe(955080);
    });

    it("should return correct yearly breakdown length", () => {
      const result = computeInflatedCost(400000, 200000, 4, 7, 5);
      expect(result.yearlyBreakdown).toHaveLength(4);
    });
  });

  // --- Moratorium ---
  describe("computeMoratoriumBalance", () => {
    it("SIMPLE: should accrue simple interest correctly", () => {
      // P=1,000,000, rate=10%pa, 12 months
      // interest = 1000000 * (10/100/12) * 12 = 100000
      const result = computeMoratoriumBalance(1000000, 10, 12, "SIMPLE");
      expect(result.principalAfterMoratorium).toBe(1100000);
      expect(result.interestAccruedDuringMoratorium).toBe(100000);
    });

    it("COMPOUND: should accrue compound interest monthly", () => {
      // P=1,000,000, rate=12%pa, 12 months
      // Each month: balance = round2(balance * 1.01)
      // The iterative round-per-month produces 1,126,825.02 (not one-shot 1,126,825.03)
      const result = computeMoratoriumBalance(1000000, 12, 12, "COMPOUND");
      // Verify the final balance is within 2 cents of the closed-form formula
      const closedForm = 1000000 * Math.pow(1 + 0.01, 12);
      expect(Math.abs(result.principalAfterMoratorium - closedForm)).toBeLessThan(0.02);
      expect(result.principalAfterMoratorium).toBe(1126825.02);
    });

    it("should handle zero moratorium months", () => {
      const result = computeMoratoriumBalance(500000, 10, 0, "COMPOUND");
      expect(result.principalAfterMoratorium).toBe(500000);
      expect(result.interestAccruedDuringMoratorium).toBe(0);
    });
  });

  // --- EMI ---
  describe("computeEMI", () => {
    it("should compute correct EMI for standard loan", () => {
      // P=1,000,000, rate=10%pa, 120 months
      // EMI = 13215.07 (standard formula)
      const emi = computeEMI(1000000, 10, 120);
      expect(emi).toBe(13215.07);
    });

    it("should handle zero interest rate", () => {
      const emi = computeEMI(120000, 0, 12);
      expect(emi).toBe(10000);
    });

    it("should return 0 for zero repayment months", () => {
      expect(computeEMI(500000, 10, 0)).toBe(0);
    });
  });

  // --- FOIR ---
  describe("computeFOIR", () => {
    it("should correctly calculate FOIR", () => {
      expect(computeFOIR(15000, 50000)).toBe(30);
    });

    it("should return 100 for zero salary", () => {
      expect(computeFOIR(10000, 0)).toBe(100);
    });
  });

  // --- Risk Band ---
  describe("classifyRisk", () => {
    it("should classify SAFE at exactly 30%", () => {
      expect(classifyRisk(30)).toBe("SAFE");
    });

    it("should classify MODERATE at 30.01%", () => {
      expect(classifyRisk(30.01)).toBe("MODERATE");
    });

    it("should classify MODERATE at exactly 45%", () => {
      expect(classifyRisk(45)).toBe("MODERATE");
    });

    it("should classify HIGH_STRESS at 45.01%", () => {
      expect(classifyRisk(45.01)).toBe("HIGH_STRESS");
    });
  });

  // --- Full computation ---
  describe("runFullComputation", () => {
    it("should run end-to-end computation without errors", () => {
      const result = runFullComputation({
        tuitionCostPerYear: 500000,
        livingCostPerYear: 300000,
        durationYears: 2,
        educationInflation: 8,
        generalInflation: 6,
        principal: 2000000,
        interestRate: 11,
        moratoriumMonths: 30,
        accrualType: "COMPOUND",
        repaymentMonths: 120,
        estimatedMonthlySalary: 80000,
      });

      expect(result.emi).toBeGreaterThan(0);
      expect(result.foir).toBeGreaterThan(0);
      expect(["SAFE", "MODERATE", "HIGH_STRESS"]).toContain(result.riskBand);
      expect(result.amortizationSchedule).toHaveLength(120);
    });
  });
});
