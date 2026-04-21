// FILE: src/components/References.tsx
// ROLE: Renders the "Trusted Partners / References" section, supporting admin edits
// READS FROM: src/data/config, src/hooks/useSettings
// USED BY: App.tsx

import { THEME, REFERENCES } from '../data/config';
import { useSettings } from '../hooks/useSettings';
import OrderSelector from './OrderSelector';
import Button from './Button';

interface ReferencesProps {
  isAdmin?: boolean;
  isInlineEnabled?: boolean;
}

// ARCHITECTURE: References
// PURPOSE: Displays a grid of reference/partner names, and handles adding, deleting, and reordering these entries in Admin mode
// DEPENDENCIES: useSettings, OrderSelector, THEME.references
// CONSUMERS: Renders near the bottom of the main application layout
export default function References({ isAdmin = false, isInlineEnabled = true }: ReferencesProps) {
  const { settings, updateSetting } = useSettings(isAdmin);
  const referencesTheme = THEME.references;
  const globalIcons = THEME.icons;

  const activeReferences = settings.referencesData && settings.referencesData.length > 0 
    ? settings.referencesData 
    : (isAdmin ? [] : REFERENCES);

  const handleDelete = (id: number) => {
    if (!window.confirm('Bu referansı silmek istediğinize emin misiniz?')) return;
    const updated = activeReferences.filter(r => r.id !== id);
    updateSetting('referencesData', updated);
  };

  const handleAdd = () => {
    const name = window.prompt('Referans/Partner Adı:');
    if (!name) return; 
    
    const newRef = { id: Date.now(), name, logo: '' }; // Logo alanını boş tutuyoruz ama şema bozulmasın diye tutuyoruz
    updateSetting('referencesData', [...activeReferences, newRef]);
  };

  const handleOrderChange = (id: number, targetPos: number) => {
    const items = Array.from(activeReferences);
    const currentIndex = items.findIndex(r => r.id === id);
    if (currentIndex === -1) return;
    
    const [item] = items.splice(currentIndex, 1);
    items.splice(targetPos - 1, 0, item);
    updateSetting('referencesData', items);
  };

  const handleTextEdit = (id: number, current: string) => {
    if (!isAdmin || isInlineEnabled) return;
    const newVal = window.prompt('Referans/Partner Adını düzenle:', current);
    if (newVal !== null) {
      const updated = activeReferences.map(r => r.id === id ? { ...r, name: newVal } : r);
      updateSetting('referencesData', updated);
    }
  };

  return (
    <section className={referencesTheme.layout}>
      <div className={referencesTheme.container}>
        
        <div className="flex items-center justify-between mb-8 border-b border-stone-100 pb-4">
          <h2 className={referencesTheme.headerTitle}>REFERANSLARIMIZ</h2>
          {isAdmin && activeReferences.length > 0 && (
            <button 
              onClick={handleAdd}
              className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-1"
            >
              <span className="w-4 h-4">{globalIcons.plus}</span> EKLE
            </button>
          )}
        </div>

        <div className={referencesTheme.grid}>
          {activeReferences.map((ref, index) => (
            <div key={ref.id} className={`${referencesTheme.card.base} relative group flex items-center justify-center p-6 text-center border-stone-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all`}>
              <span 
                contentEditable={isAdmin && isInlineEnabled}
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newName = e.currentTarget.textContent || '';
                  const updated = activeReferences.map(r => r.id === ref.id ? { ...r, name: newName } : r);
                  updateSetting('referencesData', updated);
                }}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), e.currentTarget.blur())}
                onClick={() => handleTextEdit(ref.id, ref.name)}
                className={`text-[11px] font-black uppercase tracking-[0.15em] text-stone-800 leading-tight outline-none ${isAdmin ? 'hover:bg-stone-100 focus:bg-stone-100 focus:ring-2 focus:ring-stone-900/10 px-2 -mx-2 rounded transition-all cursor-text' : ''}`}
              >
                {ref.name}
              </span>
              
              {isAdmin && (
                <>
                  {/* ORDER SELECTOR */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 opacity-100 transition-opacity">
                    <OrderSelector 
                      currentOrder={index + 1}
                      totalCount={activeReferences.length}
                      onChange={(newPos) => handleOrderChange(ref.id, newPos)}
                    />
                  </div>
 
                  {/* DELETE BUTTON: Repositioned to bottom for visual balance */}
                  <div className="absolute -bottom-2 right-4 z-20 opacity-100 transition-all">
                    <Button 
                      onClick={() => handleDelete(ref.id)}
                      variant="danger"
                      mode="square"
                      size="xs"
                      icon={globalIcons.trash}
                      title="Referansı Sil"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
          
          {isAdmin && activeReferences.length === 0 && (
            <div onClick={handleAdd} className="col-span-full border-2 border-dashed border-stone-100 rounded-2xl py-12 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-stone-50 transition-all text-stone-400 group">
              <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center group-hover:bg-white transition-colors">
                <span className="w-5 h-5">{globalIcons.plus}</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">İlk Referansı Yazıyla Ekle</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
