---
name: code
description: Senior-level engineering standards; manages clean code, modular architecture, A-level English naming, and Design Token synchronization.
---

# Code & Architecture Excellence

This guide contains the highest-level technical directives ensuring the project's structural integrity, professional clarity, and SaaS (Multi-Store) compatibility.

## 1. Architectural Integrity & SaaS Readiness

**Philosophy:** Code should be "blind"; all visual and textual intent must be managed via `config.ts`.

- **100% Active Design Tokens:** Tailwind classes or raw values (colors, spacing) must not be written directly inside `.tsx` files. Always reference the `THEME` object in `src/data/config.ts`.
- **Configuration-Oriented:** The entire look and behavior of the store must be updatable just by changing `config.ts`.
- **Logic Isolation (Hook Pattern):** Components should be **VISUAL** only (stateless/dumb). Data manipulation, API calls, and complex logic must be moved to custom hooks in `src/hooks`.

## 2. Engineering Standards (Clean Code)

**Philosophy:** A sustainable, readable, and testable codebase.

- **Single Responsibility Principle (SRP):** Every file must do only one job perfectly. If a component/file exceeds **150 lines**, it must be divided into logical sub-parts.
- **Strict Typing (TypeScript):** Clear `interface` definitions must be created for all props and functions. The use of `any` is strictly forbidden.
- **Component Hierarchy:**
  - `src/components/ui`: Atomic elements usable everywhere (Button, Modal).
  - `src/components/[feature]`: Feature-specific modules (Product, Admin).

## 3. Naming Excellence (A-Level English)

**Philosophy:** Code should be self-documenting.

- **Clarity > Brevity:** Use professional English; avoid abbreviations (`prod` -> `product`, `cat` -> `category`).
- **Standard Patterns:**
  - Components: `PascalCase` (e.g., `ProductGrid`)
  - Variables/Functions: `camelCase` (e.g., `isUserAuthenticated`)
  - Hooks: Must start with `use` (e.g., `useSale`)

## 4. Performance & Optimization

- **Render Control:** Strategically use `React.memo` for heavy components, and `useCallback`/`useMemo` to prevent unnecessary re-renders.
- **Asset Management:** Always follow `loading="lazy"`, `aspect-ratio`, and LQIP (Low-Quality Image Placeholder) strategies for images.
- **Smart Refactoring:** Continuously modernize code and improve performance without breaking functionality.

## 5. Validation Workflow (Checklist)

1. **Naming:** Are variable and function names in professional English?
2. **Design Tokens:** Do all UI values come from the `THEME` object?
3. **Modularity:** Does the file exceed 150 lines? Has logic been moved to a hook?
4. **Type Safety:** Are TypeScript definitions complete and free of `any`?

---

_Code is a tool, while architecture ensures the permanence of the vision._
