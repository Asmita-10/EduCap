import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { runFullComputation } from "../services/financialEngine";
import { generateAIRiskReport } from "../services/aiService";

const router = Router();

const PlanSchema = z.object({
  name: z.string().min(1).max(100),
  degree: z.string().min(1),
  institution: z.string().min(1),
  city: z.string().min(1),
  durationYears: z.number().int().min(1).max(10),
  tuitionCostPerYear: z.number().positive(),
  livingCostPerYear: z.number().min(0),
  educationInflation: z.number().min(0).max(50).default(8),
  generalInflation: z.number().min(0).max(50).default(6),
  principal: z.number().positive(),
  interestRate: z.number().positive().max(50),
  moratoriumMonths: z.number().int().min(0).max(120),
  accrualType: z.enum(["SIMPLE", "COMPOUND"]).default("COMPOUND"),
  repaymentMonths: z.number().int().min(12).max(360).default(120),
  estimatedMonthlySalary: z.number().positive(),
});

// GET /api/plans — list user's plans
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const plans = await prisma.plan.findMany({
      where: { userId: req.userId! },
      include: { riskReport: true },
      orderBy: { updatedAt: "desc" },
    });
    return res.json({ plans });
  } catch (err) {
    console.error("[plans/list]", err);
    return res.status(500).json({ error: "Failed to fetch plans" });
  }
});

// POST /api/plans — create plan
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const tier = req.subscription?.tier || "FREE";
    const status = req.subscription?.status || "EXPIRED";
    const activeTier = status === "ACTIVE" ? tier : "FREE";

    let limit = 1; // FREE
    if (activeTier === "PLUS") limit = 5;
    if (activeTier === "PRO") limit = Infinity;

    const count = await prisma.plan.count({ where: { userId: req.userId! } });
    if (count >= limit) {
      return res.status(403).json({
        error: `Your current tier (${activeTier}) allows up to ${limit} saved plans. Upgrade for more.`,
        code: "PLAN_LIMIT_REACHED",
        currentTier: activeTier,
        upgradeUrl: "/pricing",
      });
    }

    const data = PlanSchema.parse(req.body);

    // Run financial computation
    const computed = runFullComputation({
      tuitionCostPerYear: data.tuitionCostPerYear,
      livingCostPerYear: data.livingCostPerYear,
      durationYears: data.durationYears,
      educationInflation: data.educationInflation,
      generalInflation: data.generalInflation,
      principal: data.principal,
      interestRate: data.interestRate,
      moratoriumMonths: data.moratoriumMonths,
      accrualType: data.accrualType,
      repaymentMonths: data.repaymentMonths,
      estimatedMonthlySalary: data.estimatedMonthlySalary,
    });

    // Create plan in DB
    const plan = await prisma.plan.create({
      data: {
        userId: req.userId!,
        name: data.name,
        degree: data.degree,
        institution: data.institution,
        city: data.city,
        durationYears: data.durationYears,
        tuitionCostPerYear: data.tuitionCostPerYear,
        livingCostPerYear: data.livingCostPerYear,
        educationInflation: data.educationInflation,
        generalInflation: data.generalInflation,
        principal: data.principal,
        interestRate: data.interestRate,
        moratoriumMonths: data.moratoriumMonths,
        accrualType: data.accrualType,
        repaymentMonths: data.repaymentMonths,
        computedResults: computed as any,
      },
    });

    // Generate AI risk report for PLUS and PRO users
    let riskReport = null;
    if (activeTier === "PLUS" || activeTier === "PRO") {
      const aiReport = await generateAIRiskReport({
        degree: data.degree,
        institution: data.institution,
        city: data.city,
        foirPercent: computed.foir,
        riskBand: computed.riskBand,
        emi: computed.emi,
      });

      riskReport = await prisma.riskReport.create({
        data: {
          planId: plan.id,
          foirPercent: computed.foir,
          riskBand: computed.riskBand,
          aiSummary: aiReport.summary,
          mitigationSuggestions: JSON.stringify(aiReport.mitigationSuggestions),
          salaryRangeMin: aiReport.salaryForecast.min,
          salaryRangeMax: aiReport.salaryForecast.max,
        },
      });
    } else {
      // Free tier gets basic risk report (rule-based, no AI)
      const fallbackReport = await generateAIRiskReport({
        degree: data.degree,
        institution: data.institution,
        city: data.city,
        foirPercent: computed.foir,
        riskBand: computed.riskBand,
        emi: computed.emi,
      });

      riskReport = await prisma.riskReport.create({
        data: {
          planId: plan.id,
          foirPercent: computed.foir,
          riskBand: computed.riskBand,
          aiSummary: fallbackReport.summary,
          mitigationSuggestions: JSON.stringify(fallbackReport.mitigationSuggestions),
          salaryRangeMin: fallbackReport.salaryForecast.min,
          salaryRangeMax: fallbackReport.salaryForecast.max,
        },
      });
    }

    return res.status(201).json({ plan: { ...plan, riskReport } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues[0].message, details: err.issues });
    }
    console.error("[plans/create]", err);
    return res.status(500).json({ error: "Failed to create plan" });
  }
});

// GET /api/plans/:id
router.get("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const plan = await prisma.plan.findFirst({
      where: { id: String(req.params.id), userId: req.userId! },
      include: { riskReport: true },
    });
    if (!plan) return res.status(404).json({ error: "Plan not found" });
    return res.json({ plan });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch plan" });
  }
});

// PUT /api/plans/:id
router.put("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const data = PlanSchema.partial().parse(req.body);

    const existing = await prisma.plan.findFirst({
      where: { id: String(req.params.id), userId: req.userId! },
    });
    if (!existing) return res.status(404).json({ error: "Plan not found" });

    // Recompute if financial params changed
    const mergedParams = { ...existing, ...data };
    const computed = runFullComputation({
      tuitionCostPerYear: mergedParams.tuitionCostPerYear,
      livingCostPerYear: mergedParams.livingCostPerYear,
      durationYears: mergedParams.durationYears,
      educationInflation: mergedParams.educationInflation,
      generalInflation: mergedParams.generalInflation,
      principal: mergedParams.principal,
      interestRate: mergedParams.interestRate,
      moratoriumMonths: mergedParams.moratoriumMonths,
      accrualType: mergedParams.accrualType as "SIMPLE" | "COMPOUND",
      repaymentMonths: mergedParams.repaymentMonths,
      estimatedMonthlySalary: (mergedParams as any).estimatedMonthlySalary || 50000,
    });

    const plan = await prisma.plan.update({
      where: { id: String(req.params.id) },
      data: { ...data, computedResults: computed as any },
      include: { riskReport: true },
    });

    return res.json({ plan });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues[0].message });
    }
    return res.status(500).json({ error: "Failed to update plan" });
  }
});

// DELETE /api/plans/:id
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.plan.findFirst({
      where: { id: String(req.params.id), userId: req.userId! },
    });
    if (!existing) return res.status(404).json({ error: "Plan not found" });

    await prisma.plan.delete({ where: { id: String(req.params.id) } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete plan" });
  }
});

export default router;
