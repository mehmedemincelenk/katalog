import { THEME, REFERENCES } from '../data/config';
import { useSettings } from '../hooks/useSettings';

/**
 * REFERENCES COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * Strategic Social Proof area. Displays trusted partners with centralized styling.
 */

export default function References() {
  const { settings } = useSettings(false);
  const referencesTheme = THEME.references;

  // Use DB data or fallback to defaults
  const activeReferences = settings.referencesData && settings.referencesData.length > 0 
    ? settings.referencesData 
    : REFERENCES;

  return (
    <section className={referencesTheme.layout}>
      <div className={referencesTheme.container}>
        
        {/* HEADER: Minimalist section title */}
        <h2 className={referencesTheme.headerTitle}>
          referanslar
        </h2>

        {/* LOGO GRID: Adaptive display for various device sizes */}
        <div className={referencesTheme.grid}>
          {activeReferences.map((referenceItem) => (
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
