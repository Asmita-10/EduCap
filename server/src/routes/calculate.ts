import { Router, Request, Response } from "express";
import { z } from "zod";
import { runFullComputation } from "../services/financialEngine";
import { authenticateToken } from "../middleware/auth";
const router = Router();

const CalculateSchema = z.object({
  tuitionCostPerYear: z.number().positive(),
  livingCostPerYear: z.number().min(0),
  durationYears: z.number().int().min(1).max(10),
  educationInflation: z.number().min(0).max(50).default(8),
  generalInflation: z.number().min(0).max(50).default(6),
  principal: z.number().positive(),
  interestRate: z.number().positive().max(50),
  moratoriumMonths: z.number().int().min(0).max(120),
  accrualType: z.enum(["SIMPLE", "COMPOUND"]).default("COMPOUND"),
  repaymentMonths: z.number().int().min(12).max(360).default(120),
  estimatedMonthlySalary: z.number().positive(),
});

// POST /api/calculate — anonymous calculation (no auth required)
router.post("/", (req: Request, res: Response) => {
  try {
    const data = CalculateSchema.parse(req.body);
    const result = runFullComputation(data);

    // Don't return the full amortization schedule for anonymous calls (too heavy)
    // Return a summary + first 12 months for preview
    return res.json({
      summary: {
        totalInflatedExpense: result.inflatedCost.totalInflatedExpense,
        principalAfterMoratorium: result.moratorium.principalAfterMoratorium,
        interestAccruedDuringMoratorium: result.moratorium.interestAccruedDuringMoratorium,
        emi: result.emi,
        totalRepayment: result.totalRepayment,
        totalInterestPaid: result.totalInterestPaid,
        foir: result.foir,
        riskBand: result.riskBand,
        estimatedMonthlySalary: result.estimatedMonthlySalary,
      },
      inflatedCostBreakdown: result.inflatedCost.yearlyBreakdown,
      moratoriumBreakdown: result.moratorium.monthlyBreakdown,
      amortizationSchedule: result.amortizationSchedule,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues[0].message, details: err.issues });
    }
    return res.status(500).json({ error: "Calculation failed" });
  }
});

export default router;
