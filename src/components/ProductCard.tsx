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
 * AdminActionMenu: Ürün yönetimini sağlayan hibrit menü.
 * PC'de özel dropdown, Mobilde sistem varsayılanı kullanılır.
 */
const AdminActionMenu = memo(({ 
  product, categories, onDelete, onUpdate 
}: { 
  product: Product, categories: string[], onDelete: (id: string) => void, onUpdate: (id: string, changes: Partial<Product>) => void 
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [menuView, setMenuView] = useState<'main' | 'categories'>('main');
  const a = LABELS.adminActions;

  // Custom menü dışına tıklama kontrolü
  useEffect(() => {
    const handleClickOutside = (ev: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(ev.target as Node)) setShowCustom(false);
    };
    if (showCustom) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCustom]);

  const handleAction = (action: () => void) => { action(); setShowCustom(false); };

  // Mobil Select Değişimi
  const handleNativeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    if (val === 'DELETE') { if (window.confirm(a.confirmDelete)) onDelete(product.id); }
    else if (val === 'ARCHIVE') onUpdate(product.id, { is_archived: !product.is_archived });
    else if (val === 'STOCK') onUpdate(product.id, { inStock: !product.inStock });
    else if (val.startsWith('CAT:')) onUpdate(product.id, { category: val.replace('CAT:', '') });
    e.target.value = "";
  };

  return (
    <div className="absolute right-1 bottom-1 z-30">
      
      {/* 1. MASAÜSTÜ (CUSTOM) MENÜ - Sadece PC'de görünür */}
      <div className="hidden lg:block relative" ref={menuRef}>
        <button onClick={() => setShowCustom(!showCustom)} className={`w-6 h-6 flex items-center justify-center bg-stone-100 border border-stone-200 rounded-md hover:bg-white hover:border-stone-400 transition-all shadow-sm`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-stone-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>
        </button>

        {showCustom && (
          <div className="absolute bottom-full right-0 mb-2 w-48 bg-white/90 backdrop-blur-xl border border-stone-200 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in duration-150">
            {menuView === 'main' ? (
              <>
                <button onClick={() => setMenuView('categories')} className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-stone-800 hover:bg-stone-100 flex items-center justify-between border-b border-stone-100 uppercase"><span>{a.categories}</span> 🏷️</button>
                <button onClick={() => handleAction(() => onUpdate(product.id, { inStock: !product.inStock }))} className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-stone-800 hover:bg-stone-100 border-b border-stone-100 uppercase">{product.inStock ? '❌ ' + a.outOfStock : '✅ ' + a.inStock}</button>
                <button onClick={() => handleAction(() => onUpdate(product.id, { is_archived: !product.is_archived }))} className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-stone-800 hover:bg-stone-100 border-b border-stone-100 uppercase">{product.is_archived ? '📤 ' + a.publish : '📦 ' + a.archive}</button>
                <button onClick={() => { if(window.confirm(a.confirmDelete)) handleAction(() => onDelete(product.id)); }} className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-red-500 hover:bg-red-50 uppercase">🗑️ {a.delete}</button>
              </>
            ) : (
              <div className="flex flex-col">
                <button onClick={() => setMenuView('main')} className="w-full text-left px-3 py-2 text-[10px] font-black text-kraft-600 bg-stone-50 border-b border-stone-100 uppercase">← {LABELS.backBtn}</button>
                <div className="max-h-48 overflow-y-auto py-1">
                  {categories.map(cat => (<button key={cat} onClick={() => handleAction(() => onUpdate(product.id, { category: cat }))} className={`w-full text-left px-4 py-2 text-[11px] font-semibold hover:bg-stone-100 ${product.category === cat ? 'text-kraft-700 bg-kraft-50' : 'text-stone-600'}`}>{cat}</button>))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. MOBİL (NATIVE) MENÜ - PC'de gizlenir */}
      <div className="lg:hidden relative flex items-center justify-center w-6 h-6 bg-stone-100 rounded-md border border-stone-200 transition-all shadow-sm overflow-hidden">
        <span className="pointer-events-none text-stone-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>
        </span>
        <select onChange={handleNativeChange} value="" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full appearance-none">
          <option value="" disabled>Seç...</option>
          <optgroup label="--- İŞLEMLER ---">
            <option value="STOCK">{product.inStock ? '❌ ' + a.outOfStock : '✅ ' + a.inStock}</option>
            <option value="ARCHIVE">{product.is_archived ? '📤 ' + a.publish : '📦 ' + a.archive}</option>
            <option value="DELETE">🗑️ {a.delete}</option>
          </optgroup>
          <optgroup label="--- REYON DEĞİŞTİR ---">
            {categories.map(cat => (<option key={cat} value={`CAT:${cat}`} disabled={product.category === cat}>{cat}</option>))}
          </optgroup>
        </select>
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
          <div className="relative w-7 h-7 bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-stone-200 flex items-center justify-center overflow-hidden">
            <select 
              value={orderIndex} 
              onChange={(e) => onOrderChange?.(product.id, parseInt(e.target.value, 10))} 
              className="absolute inset-0 w-full h-full bg-transparent text-stone-900 text-[11px] font-black appearance-none text-center m-0 p-0 border-none outline-none cursor-pointer flex items-center justify-center"
              style={{ textAlignLast: 'center', textIndent: '0', paddingLeft: '0' }}
            >
              {Array.from({ length: itemsInCategory }, (_, i) => (<option key={i + 1} value={i + 1}>{i + 1}</option>))}
            </select>
          </div>
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
