---
name: design
description: Holistic design guide combining Apple-standard aesthetics, Mobile-First experience, and "Security by Design" principles.
---

# Design & Security Excellence

This guide ensures the project not only feels "desirable" and "premium" but also weaves security into the system as a design element at every stage.

## 1. Visual Aesthetics & Apple Standards (UI/UX)

**Philosophy:** "Less is more". An elegant container that highlights the content (products) without exhausting the user.

- **8px Grid System:** All spacing (padding/margin) and dimensions must be multiples of 8 (4, 8, 16, 32...). This provides a mathematical rhythm.
- **Typography:** Sans-serif (e.g., Inter, SF Pro) fonts. Titles bold, subtexts light/medium. Increase readability with `leading-relaxed` (1.5).
- **Minimalist Palette (60-30-10):** 60% neutral (Stone/Slate), 30% secondary, 10% accent color (Amber/Kraft).
- **Depth and Layers:** Convey hierarchy with `backdrop-blur-xl` and soft shadows.

## 2. Mobile-First & Touch Experience

**Philosophy:** A thumb-friendly flow that even a 40-50 age group can use without difficulty.

- **Touch Targets:** Every clickable area must be at least **44x44px**.
- **Responsive Grid:** Single column on mobile, 2, 3, or 4 columns on desktop depending on product type.
- **Performance (LCP):** `loading="lazy"` for images, `fetchpriority="high"` for critical images (Hero). Always maintain the LQ/HQ image separation.
- **Bottom Menu (Tab Bar):** Keep critical actions (Categories, Search, Admin) in the bottom half of the screen (thumb zone) during mobile use.

## 3. Cyber Defense & Architectural Security (Sec-by-Design)

**Philosophy:** "Zero Trust". Security is not an add-on; it's the foundation of design.

- **SaaS & Tenant Isolation:** To prepare for multi-store structure, require a `tenant_id` (or store_slug) filter in every query.
- **Principle of Least Privilege:** The admin panel must only be accessible with a valid PIN/Session. Use messages that don't give clues to attackers on failed logins.
- **Input Security (XSS/CSRF):** Cleanse all data coming from the user. Avoid using `dangerouslySetInnerHTML`.
- **Secrets Management:** Never hardcode `.env` or API keys into the code.

## 4. Interactive Feedback (Micro-interactions)

**Philosophy:** The site giving a "living" and "physical" reaction to every user movement.

- **Active States:** Give a physical pressing sensation with a `scale-95` effect when buttons are clicked.
- **Haptic & Visual Feedback:** Provide a clear notification and visual confirmation when an operation is successful (e.g., Price increase applied).
- **Smooth Transitions:** Modals and category transitions should open with a soft `fade-in` or `slide` effect, not abruptly.

## 5. Implementation Strategy

1. **Think:** "Is this feature big enough for a 50-year-old shop owner?"
2. **Question:** "How can this new data entry system be exploited?"
3. **Apply:** "Does it comply with the 8px rule and mobile-first grid structure?"

---

_The best design is the one where the user doesn't notice it's there but it works perfectly._
