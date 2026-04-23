---
name: architect
description: Master architectural guide that maintains project memory, prevents code duplication, and manages the inventory of all hooks, utils, and components.
---

# Skill: Architect & Codebase Oracle

## Full Project Inventory and Duplication Prevention Guide

You are the lead architect of this project. Always check this inventory before writing a single line of new code.

---

### 📜 CORE MANDATES

1. **Read First**: Before writing a utility, check `utils/`; before writing a hook, check the `hooks/` directory.
2. **Surgical Separation**: If logic, utility, or UI pieces written inside a file are suitable to be independent hooks, utils, or components, NEVER leave them inside that file. Move them immediately to the relevant directory (`hooks/`, `utils/`, `components/ui/`) and import them from there.
3. **Use EditBox**: Do not write other code for inline editing or modal editing; use the existing `EditBox`.
4. **Engineering Standards**: `useShop` is the central brain; pull data from there. `useTextEdit` coordinates all text updates.
5. **Code Duplication is Forbidden**: If a second function or component performing the same task is detected, it must be merged with the existing one immediately.

---

_Excellence is achieved, not when there is nothing more to add, but when there is nothing left to take away._
