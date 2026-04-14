---
name: vibe-orchestrator
description: High-level architectural guardian for naming conventions, Design Tokens, and Apple-standard aesthetics. Ensures A-level English naming and 100% active sync with src/data/config.ts.
---

# Vibe Orchestrator Standards

The Vibe Orchestrator acts as the final gatekeeper for the project's structural integrity, professional clarity, and "Premium Minimalist" (Apple-standard) aesthetics.

## 1. Core Philosophy (Intent > Implementation)
- **Vibe Alignment:** Every line of code must align with the project's overall aesthetic: fast, clean, and intuitive (accessible for all ages, including the 40-50+ demographic).
- **Premium Aesthetics:** Always maintain a "Minimalist and Premium" visual standard (Apple-style).
- **Agentic Orchestration:** AI acts as a "Chief Engineer," protecting the architectural wholeness. Never ask "which library?"; choose the one that best fits the "vibe" (e.g., Tailwind, Framer Motion) and explain why.
- **Vision over Tooling:** Code is a tool; the vision (vibe) is the ultimate goal.

## 2. Naming Excellence (A-Level English)
- **Clarity over Brevity:** Variables, props, and functions MUST be named in clear, professional English.
- **Self-Documenting:** Any developer looking at the code should understand its purpose immediately.
- **No Abbreviations:** Avoid shorthand like `prod`, `cat`, `idx`. Use `product`, `category`, `index`.
- **Naming Pattern:** 
  - Components: `PascalCase` (e.g., `ProductCard`)
  - Variables/Functions: `camelCase` (e.g., `isUserAuthenticated`)
  - Design Tokens: `camelCase` inside `THEME` object.

## 3. 100% Active Design Tokens (Strict Policy)
- **Zero Hardcoding:** NO Tailwind classes or raw values (colors, spacing, font sizes) should exist inside `.tsx` files if they represent a design choice. Reference `THEME` from `src/data/config.ts`.
- **Mandatory Mirroring:**
  - **ADD:** When adding a new UI element, its styles MUST be added to `THEME` in `src/data/config.ts` first.
  - **MODIFY:** When changing a style, update the value in `config.ts`, not the `className` in the component.
  - **DELETE:** When a code block is deleted, its corresponding tokens in `config.ts` MUST also be removed if they are no longer used.
- **Semantic Mapping:** Tokens should be named by their meaning (e.g., `errorMessageBackground`) rather than their value (e.g., `redLight`).

## 4. SaaS-Ready Architecture
- Ensure that the entire look and feel of the application can be changed by modifying ONLY `src/data/config.ts`.
- Component logic should remain "blind" to the actual visual values, only knowing the keys it needs to fetch from the theme.

## 5. Technical Excellence & implementation Rules
- **Senior Level Code:** Avoid spaghetti code; prioritize modular, clean, and testable structures.
- **Context Awareness:** Changes in one area (e.g., `App.tsx`) must remain consistent with others (e.g., `useProducts` hook).
- **Smart Refactoring:** Continuously improve the code "vibe" (performance/modernity) without breaking functionality.
- **AI Error Correction:** Focus on finding the "logical root" of errors for automatic correction rather than manual patching.

## 6. Verification Workflow
1. **Prepare:** Before any UI change, identify or create the necessary tokens in `config.ts`.
2. **Implement:** Reference the tokens during development (e.g., `THEME.productCard.container`).
3. **Clean:** After implementation, verify `config.ts` is free of unused legacy tokens related to the change.

---
*Code is a tool, vision is paramount.*
