# EduCap - Financial Terms Explained Feature

This documentation details the **Financial Terms Explained** page (`/terms-explained`) addition to the EduCap client UI.

## Overview
The **Financial Terms Explained** page provides a simplified, searchable glossary of core education loan terms and financial metrics used across the EduCap platform. It uses a single concise answer format (`ans: ...`) for clarity without analogies.

---

## Features

### 1. Navigation Integration
- Added `"Financial Terms"` navigation link to the top header navbar (`Navbar.tsx`).
- Placed directly next to `"Calculator"`.
- Routes to `/terms-explained`.

### 2. Search & Filtering
- Interactive real-time search input powered by Lucide's `Search` icon.
- Dynamically filters financial terms by matching user queries against term titles and definitions (`ans`).
- Displays a clean empty state with a `HelpCircle` icon if no terms match the query.

### 3. Concise Answer Format (`ans:`)
- Data definitions strictly formatted using single concise explanations.
- Each term card highlights the `<span className="font-bold text-[#1E5D50] mr-1">ans:</span>` tag.

### 4. Design & Color Palette Alignment
- **Background:** Warm Light Cream Neutral (`bg-[#F2F0ED]`).
- **Cards:** Crisp warm off-white (`bg-[#FAF9F6]`), border (`border-[#E2DFD8]`), `rounded-2xl`, and `shadow-sm`.
- **Typography:** Titles (`text-[#111827]`), Subtitles (`text-[#6B7280]`), Answer accent (`text-[#1E5D50]`).
- **Icons:** Pure Lucide React SVG icons (`BookOpen`, `Search`, `HelpCircle`) — zero text emojis.

---

## Included Financial Terms
1. **Moratorium Period**
2. **Compounding Interest during Moratorium**
3. **FOIR (Fixed Obligation to Income Ratio)**
4. **Amortization Schedule**
5. **Floating vs. Fixed Interest Rate**
6. **Subsidized vs. Unsubsidized Interest**
7. **Prepayment Penalty & Foreclosure**
8. **Processing Fee & Capitalization**
9. **Collateral & Margin Money**
10. **Grace Period vs. Repayment Tenure**
