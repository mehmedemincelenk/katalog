import { THEME, REFERENCES } from '../data/config';
import { useSettings } from '../hooks/useSettings';
import OrderSelector from './OrderSelector';
import Button from './Button';

interface ReferencesProps {
  isAdmin?: boolean;
  isInlineEnabled?: boolean;
}

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
    <section className={`${referencesTheme.layout} !py-8`}>
      <div className={referencesTheme.container}>
        
        {/* CENTERED HEADER SECTION */}
        <div className="flex flex-col items-center justify-center mb-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tighter uppercase leading-none">
            REFERANSLARIMIZ
          </h2>
          <div className="w-12 h-1 bg-stone-900 mt-4 mb-2 rounded-full opacity-10"></div>
        </div>

        <div className={referencesTheme.grid}>
          {activeReferences.map((ref, index) => (
            <div key={ref.id} className={`${referencesTheme.card.base} relative group flex items-center justify-center p-8 text-center border-stone-100 bg-white shadow-[0_2px_15px_-5px_rgba(0,0,0,0.08)] hover:shadow-xl hover:shadow-stone-200/50 transition-all rounded-[32px]`}>
              
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
                className={`text-[12px] font-black uppercase tracking-[0.2em] text-stone-800 leading-tight outline-none ${isAdmin ? 'hover:bg-stone-50 focus:bg-stone-50 focus:ring-2 focus:ring-stone-900/10 px-3 py-1 -mx-3 rounded-xl transition-all cursor-text' : ''}`}
              >
                {ref.name}
              </span>
              
              {isAdmin && (
                <>
                  {/* ORDER SELECTOR - DARK THEME & TOP LEFT */}
                  <div className="absolute top-2 left-2 z-10 transition-transform hover:scale-105">
                    <OrderSelector 
                      currentOrder={index + 1}
                      totalCount={activeReferences.length}
                      onChange={(newPos) => handleOrderChange(ref.id, newPos)}
                      isDark={true}
                      className="shadow-xl"
                    />
                  </div>
 
                  {/* DELETE BUTTON - TOP RIGHT */}
                  <div className="absolute top-2 right-2 z-20 transition-transform hover:scale-105">
                    <Button 
                      onClick={() => handleDelete(ref.id)}
                      variant="danger"
                      mode="circle"
                      size="sm"
                      icon={globalIcons.trash}
                      className="!w-7 !h-7 shadow-lg"
                      title="Referansı Sil"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
          
          {isAdmin && activeReferences.length === 0 && (
            <div className="col-span-full border-2 border-dashed border-stone-100 rounded-[40px] py-16 flex flex-col items-center justify-center gap-3 text-stone-300 bg-stone-50/50">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-stone-100 mb-2">
                <span className="text-xl">🤝</span>
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-center px-8 leading-loose opacity-60">
                HENÜZ REFERANS EKLENMEMİŞ
              </span>
              <p className="text-[9px] font-bold text-stone-400 italic">
                Sağ alttaki "+" butonuna basıp "Yeni Referans"ı seçin
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
