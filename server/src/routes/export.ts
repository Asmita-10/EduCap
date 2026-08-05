import { Router, Response } from "express";
import PDFDocument from "pdfkit";
import { prisma } from "../utils/prisma";
import { authenticateToken, requireTier, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/plans/:id/export — PDF export (premium only)
router.get("/:id/export", authenticateToken, requireTier("PLUS"), async (req: AuthRequest, res: Response) => {
  try {
    const plan = await prisma.plan.findFirst({
      where: { id: String(req.params.id), userId: req.userId! },
      include: { riskReport: true },
    });

    if (!plan) return res.status(404).json({ error: "Plan not found" });

    const computed = plan.computedResults as any;
    const report = (plan as any).riskReport;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="EduCap-${plan.name.replace(/\s+/g, "-")}.pdf"`);

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    doc.pipe(res);

    // Header
    doc.fontSize(24).fillColor("#6c47ff").text("EduCap", { align: "center" });
    doc.fontSize(12).fillColor("#666").text("Student Loan Financial Analysis Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).fillColor("#999").text("⚠️ EduCap provides estimates/education, not licensed financial advice.", { align: "center" });
    doc.moveDown(2);

    // Plan Details
    doc.fontSize(14).fillColor("#222").text("Plan Overview", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#333");
    doc.text(`Plan Name: ${plan.name}`);
    doc.text(`Degree: ${plan.degree} at ${plan.institution}, ${plan.city}`);
    doc.text(`Duration: ${plan.durationYears} year(s)`);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`);
    doc.moveDown();

    // Risk Band
    const bandColor = report?.riskBand === "SAFE" ? "#16a34a" :
      report?.riskBand === "MODERATE" ? "#d97706" : "#dc2626";
    doc.fontSize(14).fillColor("#222").text("Risk Assessment", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(16).fillColor(bandColor).text(`Risk Band: ${report?.riskBand?.replace("_", " ") || "N/A"}`, { align: "center" });
    doc.fontSize(12).fillColor("#333").text(`FOIR: ${report?.foirPercent?.toFixed(2) || 0}%`, { align: "center" });
    doc.moveDown();

    // Financial Summary
    doc.fontSize(14).fillColor("#222").text("Financial Summary", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#333");
    const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
    doc.text(`Loan Principal: ${fmt(plan.principal)}`);
    doc.text(`Interest Rate: ${plan.interestRate}% per annum`);
    doc.text(`Moratorium: ${plan.moratoriumMonths} months (${plan.accrualType})`);
    doc.text(`Balance After Moratorium: ${fmt(computed?.moratorium?.principalAfterMoratorium || 0)}`);
    doc.text(`Monthly EMI: ${fmt(computed?.emi || 0)}`);
    doc.text(`Repayment Tenure: ${plan.repaymentMonths} months`);
    doc.text(`Total Repayment: ${fmt(computed?.totalRepayment || 0)}`);
    doc.text(`Total Interest Paid: ${fmt(computed?.totalInterestPaid || 0)}`);
    doc.moveDown();

    // Salary & FOIR
    doc.fontSize(14).fillColor("#222").text("Salary & FOIR", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#333");
    doc.text(`Estimated Salary Range: ${fmt(report?.salaryRangeMin || 0)} – ${fmt(report?.salaryRangeMax || 0)} / month`);
    doc.text(`FOIR: ${report?.foirPercent?.toFixed(2) || 0}% (Safe ≤30% | Moderate 30–45% | High Stress >45%)`);
    doc.moveDown();

    // AI Summary
    if (report?.aiSummary) {
      doc.fontSize(14).fillColor("#222").text("Risk Analysis", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor("#333").text(report.aiSummary);
      doc.moveDown();
    }

    // Mitigation
    if (report?.mitigationSuggestions) {
      const suggestions = JSON.parse(report.mitigationSuggestions) as string[];
      doc.fontSize(14).fillColor("#222").text("Mitigation Suggestions", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor("#333");
      suggestions.forEach((s, i) => {
        doc.text(`${i + 1}. ${s}`);
        doc.moveDown(0.3);
      });
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(9).fillColor("#aaa").text(
      "Disclaimer: This report is for educational and planning purposes only. EduCap is not a licensed financial advisor. Please consult a certified financial planner before making borrowing decisions.",
      { align: "center" }
    );

    doc.end();
  } catch (err) {
    console.error("[export]", err);
    return res.status(500).json({ error: "Failed to generate PDF" });
  }
});

export default router;
