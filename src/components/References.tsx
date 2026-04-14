import { THEME, REFERENCES, LABELS } from '../data/config';

/**
 * REFERENCES COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * Strategic Social Proof area. Displays trusted partners with centralized styling.
 */

export default function References() {
  const referencesTheme = THEME.references;

  return (
    <section className={referencesTheme.layout}>
      <div className={referencesTheme.container}>
        
        {/* HEADER: Authoritative and clean social proof title */}
        <h2 className={referencesTheme.headerTitle}>
          {LABELS.referencesTitle}
        </h2>

        {/* LOGO GRID: Adaptive display for various device sizes */}
        <div className={referencesTheme.grid}>
          {REFERENCES.map((referenceItem) => (
            <div
              key={referenceItem.id}
              className={referencesTheme.card.base}
            >
              {/* BRAND VISUAL: Minimalist emoji-based logos for speed and vibe */}
              <span 
                className={referencesTheme.card.logoSize} 
                aria-hidden="true"
              >
                {referenceItem.logo}
              </span>
              
              {/* BRAND IDENTITY: Clean and readable brand naming */}
              <span className={referencesTheme.card.name}>
                {referenceItem.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
