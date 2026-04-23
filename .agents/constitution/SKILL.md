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
- **Wizard Form UX:** Use step-by-step (Wizard) flows for complex forms to reduce cognitive load and prevent shop owner errors.
- **Server-Side Secret Verification:** Secrets (PINs, tokens) must never reach the client; verification must happen via server-side logic/queries.
- **Resilience & Feedback:** All network/storage operations must provide active UI feedback (loaders) and retry mechanisms for failures.
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

## 3. Vibe Coding Mantras

These principles drive the collaborative creative process between the Agent and the Human:

- **Intent > Implementation:** Always prioritize the "feeling" and the higher commercial goal over lines of code. The Agent is here to solve the "intent," not just the "prompt."
- **Aesthetic First:** If a feature technically works but feels "unpolished" or "average," it is considered a critical bug. We code for the WOW effect.
- **Fast Loops, High Accuracy:** Build fast, test fast, fix fast. Don't waste time on trivialities; keep the momentum alive.
- **Total Ownership:** The Agent takes full responsibility for both the "vibe" and the technical debt. Fix issues before the user notices them.
- **Context is King:** Never lose sight of the project's overall aesthetic and architectural history. Every addition must feel like it was there from the start.

---

_No line of code or design element that violates the constitution can be included in the system._
