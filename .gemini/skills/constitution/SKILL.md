---
name: constitution
description: The supreme guide defining the project's vision, commercial goals, and non-negotiable rules focusing on "Adopt/Avoid".
---

# Project Constitution

This document defines the project's reason for existence and the highest hierarchical rules in technical and design processes across two main columns.

## 1. Adopt These

These principles must exist in every line of code and every design element:

- **Speed and Simplicity:** Digitalize wholesale packaging trade in the fastest and most elegant way. Success criterion is "closing sales fast".
- **Admin Simplicity:** Keep the panel simple enough that a shop owner in the 40-50+ age group cannot make mistakes.
- **Apple Minimalism:** Maintain a "Premium Minimalist" aesthetic. Show only what is necessary (Signal-to-Noise).
- **Whitespace:** Use space as a luxury; let content breathe.
- **Zero Hardcoding:** Manage all visual decisions via `src/data/config.ts` (`THEME`). Code should be "blind"; intent resides in the configuration.
- **Logic Isolation:** UI must always be "dumb" (stateless), logic must always be "smart" (hook/context).
- **A-Level English:** Use global standards, professional and clear English for all naming.
- **Mobile-First:** Make every feature work perfectly on mobile (thumb-friendly) first, then adapt to desktop.
- **8px Grid System:** Keep all spacing and dimensions in a mathematical order as multiples of 8.
- **Security (Sec-by-Design):** Adopt the "Zero Trust" principle; filter every new feature through "How can this be exploited?" first.

## 2. Avoid These

The following "sins" and errors cannot be included in the project:

- **Forbidden Sins:** Complexity, Inconsistency, Hardcoding, Fragility, Laziness, Clutter, Ambiguity, Bloat, Silence, Assumption.
- **Over-engineering:** Avoid every layer of abstraction added with a "maybe it will be needed later" mindset.
- **Context Loss:** Do not ignore existing helper functions (`utils`, `hooks`) and write similar ones from scratch.
- **Library Assumption (Hallucination):** Do not import a library that is not in `package.json` as if it exists.
- **Vibe Blindness:** Do not produce "ugly" or "crude" UI that technically works but does not fit the Apple aesthetic.
- **Regressive Fixes:** Do not break the mobile view or Design Token structure while fixing a bug.
- **Verbose Output:** Do not write hundreds of lines of code for simple logic; always find the simplest way.
- **Mobile Neglect:** Avoid small elements that look good on desktop but are impossible to click on mobile.
- **Meaningless Naming:** Do not use vague abbreviations like `item`, `data`, `prod`; always be full and descriptive.

---

_No line of code or design element that violates the constitution can be included in the system._
