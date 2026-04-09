import { useRef, useState, useEffect, useLayoutEffect, useMemo, memo } from 'react';
import { UI, LABELS, TECH, CARD_STYLE } from '../data/config';
import { Product } from '../types';
import { getImageUrl, PLACEHOLDER_EMOJI } from '../utils/image';
import { calculateDiscount } from '../utils/price';

/**
 * PRODUCT CARD BİLEŞENİ (ÜRÜNÜN KİMLİĞİ)
 * ------------------------------------
 * Bir girişimci olarak bu bileşen senin "Sessiz Satış Elemanındır".
 * 
 * 1. Görsel Algı: Ürün fotoğrafı, müşterinin ilk bağ kurduğu yerdir. Stokta yoksa otomatik grileşerek hayal kırıklığını önler.
 * 2. Bilgi Hiyerarşisi: İsim, açıklama ve fiyat dengesi müşterinin "Anlama -> Karar Verme" sürecini hızlandırır.
 * 3. Hızlı Müdahale: Admin modunda ürün ismine, fiyatına veya açıklamasına tıklayarak anında düzenleme yapabilirsin.
 * 4. Akıllı Menü: iOS tarzı aksiyon menüsü ile silme, arşivleme ve reyon değiştirme işlemleri avucunun içindedir.
 */

// --- YARDIMCI BİLEŞENLER ---

/**
 * AdminActionMenu: Ürün üzerindeki yönetim butonlarını içeren akıllı menü.
 */
const AdminActionMenu = memo(({ 
  product, categories, onDelete, onUpdate 
}: { 
  product: Product, categories: string[], onDelete: (id: string) => void, onUpdate: (id: string, changes: Partial<Product>) => void 
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showActions, setShowActions] = useState(false);
  const [menuView, setMenuView] = useState<'main' | 'categories'>('main');
  const [menuDirection, setMenuDirection] = useState<'left' | 'right'>('right');

  const a = LABELS.adminActions;

  useLayoutEffect(() => {
    if (showActions && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      setMenuDirection(rect.right > window.innerWidth - 20 ? 'left' : 'right');
    }
    if (!showActions) setMenuView('main');
  }, [showActions]);

  useEffect(() => {
    const handleClickOutside = (ev: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(ev.target as Node) && !(ev.target as HTMLElement).closest('.admin-trigger')) {
        setShowActions(false);
      }
    };
    if (showActions) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActions]);

  const handleAction = (action: () => void) => { action(); setShowActions(false); };

  return (
    <div className={`absolute right-1.5 bottom-1.5 ${showActions ? 'z-[60]' : 'z-20'}`}>
      <div className="relative">
        <button onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }} className={`w-5 h-5 admin-trigger flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors active:scale-90`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 pointer-events-none"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>
        </button>

        {showActions && (
          <div ref={menuRef} style={{ transformOrigin: menuDirection === 'right' ? 'top left' : 'top right' }} className={`absolute bottom-full ${menuDirection === 'right' ? 'left-0' : 'right-0'} mb-2 w-48 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl py-1.5 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200`} onClick={(e) => e.stopPropagation()}>
            {menuView === 'main' ? (
              <>
                <button onClick={() => { if(window.confirm(a.confirmDelete)) handleAction(() => onDelete(product.id)); }} className="w-full text-left px-4 py-3 text-[13px] font-semibold text-red-500 hover:bg-red-50/50 transition-colors border-b border-black/5 uppercase">{a.delete}</button>
                <button onClick={() => handleAction(() => onUpdate(product.id, { is_archived: !product.is_archived }))} className="w-full text-left px-4 py-3 text-[13px] font-semibold text-stone-800 hover:bg-black/5 transition-colors border-b border-black/5 uppercase">{product.is_archived ? a.publish : a.archive}</button>
                <button onClick={() => handleAction(() => onUpdate(product.id, { inStock: !product.inStock }))} className="w-full text-left px-4 py-3 text-[13px] font-semibold text-stone-800 hover:bg-black/5 transition-colors border-b border-black/5 uppercase">{product.inStock ? a.outOfStock : a.inStock}</button>
                <button onClick={() => setMenuView('categories')} className="w-full text-left px-4 py-3 text-[13px] font-semibold text-stone-800 hover:bg-black/5 transition-colors flex items-center justify-between uppercase"><span>{a.categories}</span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 opacity-30"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></button>
              </>
            ) : (
              <div className="flex flex-col max-h-64 overflow-hidden">
                <button onClick={() => setMenuView('main')} className="w-full text-left px-3 py-2 text-[11px] font-bold text-kraft-600 bg-kraft-50/50 border-b border-black/5 uppercase flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg> {LABELS.backBtn}</button>
                <div className="overflow-y-auto py-1">
                  {categories.map(cat => (<button key={cat} onClick={() => handleAction(() => onUpdate(product.id, { category: cat }))} className={`w-full text-left px-4 py-2.5 text-[12px] font-medium hover:bg-black/5 ${product.category === cat ? 'text-kraft-700 font-bold' : 'text-stone-600'}`}>{cat}</button>))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

/**
 * MarqueeText: Ürün ismi çok uzunsa otomatik kaydırır.
 */
const MarqueeText = memo(({ text, textClass, isAdmin, editableProps = {} }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  const { className: editableClass = '', ...restEditable } = editableProps;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const check = () => setOverflow(el.scrollWidth > el.clientWidth + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  return (
    <div ref={containerRef} className={`overflow-hidden ${isAdmin ? 'whitespace-normal' : 'whitespace-nowrap'} ${textClass} ${editableClass}`} {...restEditable}>
      {overflow && !isAdmin ? <span className="marquee-track inline-block">{text}&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;</span> : <span>{text}</span>}
    </div>
  );
});

/**
 * DescriptionScroll: Ürün açıklaması taştığında dikeyde kaydırır.
 */
const DescriptionScroll = memo(({ lines, lineClass, maxHeightClass }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const check = () => setOverflow(el.scrollHeight > el.clientHeight + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [lines]);

  const renderLines = (keyPrefix: string) => lines.map((line: string, i: number) => (
    <div key={`${keyPrefix}-${i}`} className={`${lineClass} flex gap-1 items-baseline`}><span className="text-stone-400 shrink-0">•</span><span>{line}</span></div>
  ));

  return (
    <div ref={containerRef} className={`${maxHeightClass} overflow-hidden`}>
      {overflow ? <div className="desc-scroll-track">{renderLines('a')}{renderLines('b')}</div> : renderLines('a')}
    </div>
  );
});

// --- ANA BİLEŞEN ---

const ProductCard = memo(({
  product, categories = [], isAdmin, onDelete, onUpdate, onOrderChange, orderIndex = 1, itemsInCategory = 1, activeDiscount,
}: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const descAreaRef = useRef<HTMLTextAreaElement>(null);

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempDesc, setTempDesc] = useState(product.description || '');
  const [imgError, setImgError] = useState(false);

  const s = CARD_STYLE;
  const a = LABELS.adminActions;

  useEffect(() => {
    if (isEditingDesc && descAreaRef.current) {
      descAreaRef.current.style.height = 'auto';
      descAreaRef.current.style.height = `${descAreaRef.current.scrollHeight}px`;
    }
  }, [tempDesc, isEditingDesc]);

  // Görsel Değiştirme (Admin)
  const handleFileChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      const { compressImage } = await import('../utils/image');
      const compressedStr = await compressImage(file, TECH.image.productSize, TECH.image.quality) as string;
      onUpdate(product.id, { image: compressedStr });
    } catch { alert(LABELS.saveError); }
    ev.target.value = '';
  };

  const updateField = (field: keyof Product, value: string | boolean | null) => {
    if (value !== (product[field] || '')) onUpdate(product.id, { [field]: value });
  };

  // İndirim Uygulama
  const isDiscountActive = activeDiscount && (!activeDiscount.category || activeDiscount.category === product.category);
  const displayPrice = isDiscountActive ? calculateDiscount(product.price, activeDiscount.rate) : product.price;

  return (
    <article ref={cardRef as React.RefObject<HTMLDivElement>} data-product-id={product.id} className={`bg-white border ${product.inStock === false ? 'border-transparent bg-stone-50' : 'border-stone-200'} rounded-lg flex flex-col group hover:shadow-md transition-all duration-300 relative`}>
      
      {/* SIRA NUMARASI (Admin) */}
      {isAdmin && (
        <div className="absolute top-2 right-2 z-[25] hover:scale-105 active:scale-95 transition-transform">
          <select value={orderIndex} onChange={(e) => onOrderChange?.(product.id, parseInt(e.target.value, 10))} className="appearance-none bg-white/90 backdrop-blur-md text-stone-900 text-[11px] font-black w-7 h-7 rounded-lg shadow-lg border border-stone-200 text-center cursor-pointer focus:outline-none outline-none">
            {Array.from({ length: itemsInCategory }, (_, i) => (<option key={i + 1} value={i + 1}>{i + 1}</option>))}
          </select>
        </div>
      )}

      {/* ÜRÜN GÖRSELİ */}
      <div className={`relative w-full bg-stone-100 aspect-square flex items-center justify-center rounded-t-lg ${isAdmin ? 'cursor-pointer' : ''}`} onClick={() => isAdmin && fileInputRef.current?.click()}>
        {product.image && !imgError ? (
          <img src={getImageUrl(product.image) || ''} alt={product.name} onError={() => setImgError(true)} className={`w-full h-full object-cover rounded-t-lg transition-all duration-300 ${product.inStock === false ? 'grayscale opacity-60' : ''}`} draggable={false} loading="lazy" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-stone-300 select-none"><span className="text-5xl">{PLACEHOLDER_EMOJI}</span></div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {/* ÜRÜN BİLGİLERİ */}
      <div className={`px-2 py-2 flex flex-col gap-0.5 flex-grow`}>
        {/* ÜRÜN İSMİ (Düzenlenebilir) */}
        <MarqueeText text={product.name} textClass={`${s.nameSize} ${s.nameWeight} ${s.nameColor} ${s.nameLeading} transition-all duration-300 ${product.inStock === false ? 'opacity-60 text-stone-500' : ''}`} isAdmin={isAdmin} editableProps={isAdmin ? { contentEditable: true, suppressContentEditableWarning: true, onBlur: (ev: any) => updateField('name', ev.currentTarget.textContent?.trim() || ''), onKeyDown: (e: any) => e.key === 'Enter' && (e.preventDefault(), e.currentTarget.blur()), className: `cursor-text focus:outline-none ${s.adminEditBg} px-0.5 rounded outline-none` } : {}} />
        
        {/* ÜRÜN AÇIKLAMASI */}
        <div className="relative min-h-[24px]">
          {isAdmin ? (
            isEditingDesc ? (
              <textarea ref={descAreaRef} value={tempDesc} onChange={(ev) => setTempDesc(ev.target.value)} onBlur={() => (setIsEditingDesc(false), updateField('description', tempDesc.trim()))} className={`w-full ${s.descSize} ${s.descColor} ${s.descLeading} ${s.adminEditBg} border border-amber-200 rounded px-1 py-0.5 focus:outline-none resize-none overflow-hidden block`} autoFocus />
            ) : (
              <div onClick={(ev) => (ev.stopPropagation(), setIsEditingDesc(true))} className={`w-full px-1 py-0.5 ${s.descSize} ${s.descColor} ${s.descLeading} cursor-text hover:${s.adminEditBg} rounded transition-colors ${!product.description ? 'text-stone-300 italic' : ''}`}>{product.description || a.addDescription}</div>
            )
          ) : (
            product.description && (<DescriptionScroll lines={product.description.split('\n').filter(Boolean)} lineClass={`${s.descSize} ${s.descColor} ${s.descLeading}`} maxHeightClass={s.descMaxH} />)
          )}
        </div>

        {/* FİYAT ALANI */}
        <div className="mt-auto">
          <div contentEditable={isAdmin} suppressContentEditableWarning onBlur={(e: any) => { let val = e.currentTarget.textContent?.trim() || ''; if (val && !val.startsWith('₺')) val = '₺' + val; updateField('price', val); }} onKeyDown={(e: any) => e.key === 'Enter' && (e.preventDefault(), e.currentTarget.blur())} className={`${s.priceSize} ${s.priceWeight} ${isDiscountActive ? s.discountColor : s.priceColor} transition-all duration-500 ${isAdmin ? `cursor-text focus:outline-none ${s.adminEditBg} px-0.5 rounded outline-none` : ''} ${product.inStock === false && !isAdmin ? 'line-through opacity-60 text-stone-500' : ''}`}>
            {displayPrice}
          </div>
        </div>
      </div>

      {/* ADMİN AKSİYON MENÜSÜ */}
      {isAdmin && (<AdminActionMenu product={product} categories={categories} onDelete={onDelete} onUpdate={onUpdate} />)}

      {/* DURUM İKONLARI (Arşiv / Stok Yok) */}
      <div className="absolute inset-0 z-[5] pointer-events-none rounded-lg flex items-center justify-center gap-2">
        {!product.inStock && (<div className="bg-stone-900/90 text-white w-8 h-8 rounded-full shadow-xl flex items-center justify-center -translate-y-4">{s.statusIcons.outOfStock}</div>)}
        {product.is_archived && (<div className="bg-stone-900/90 text-white w-8 h-8 rounded-full shadow-xl flex items-center justify-center -translate-y-4">{s.statusIcons.archived}</div>)}
      </div>
    </article>
  );
});

export default ProductCard;
