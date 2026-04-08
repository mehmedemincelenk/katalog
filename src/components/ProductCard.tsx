import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { CARD_TYPOGRAPHY as CT, CARD_LAYOUT as CL, DISCOUNT_UI } from '../data/config';
import { Product } from '../types';
import { getImageUrl, PLACEHOLDER_EMOJI } from '../utils/image';
import { calculateDiscount } from '../utils/price';

// --- Yardımcı Bileşen Tipleri ---

interface MarqueeTextProps {
  text: string;
  textClass: string;
  isAdmin: boolean;
  editableProps?: React.HTMLAttributes<HTMLDivElement> & {
    suppressContentEditableWarning?: boolean;
  };
}

interface DescriptionScrollProps {
  lines: string[];
  lineClass: string;
  maxHeightClass: string;
}

interface ProductCardProps {
  product: Product;
  categories: string[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, changes: Partial<Product>) => void;
  onOrderChange?: (id: string, newOrderValue: number) => void;
  orderIndex?: number;
  itemsInCategory?: number;
  activeDiscount?: { code: string; rate: number; category?: string } | null;
}

// --- Yardımcı Bileşenler (Dahili) ---

function MarqueeText({ text, textClass, isAdmin, editableProps = {} }: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  const { className: editableClass = '', ...restEditable } = editableProps;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const check = () => setOverflow(el.scrollWidth > el.clientWidth + CL.marqueeTolerance);
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
}

function DescriptionScroll({ lines, lineClass, maxHeightClass }: DescriptionScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const check = () => setOverflow(el.scrollHeight > el.clientHeight + CL.marqueeTolerance);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [lines]);

  const renderLines = (keyPrefix: string) => lines.map((line, i) => (
    <div key={`${keyPrefix}-${i}`} className={`${lineClass} flex gap-1 items-baseline`}><span className="text-stone-400 shrink-0">•</span><span>{line}</span></div>
  ));

  return (
    <div ref={containerRef} className={`${maxHeightClass} overflow-hidden`}>
      {overflow ? <div className="desc-scroll-track">{renderLines('a')}{renderLines('b')}</div> : renderLines('a')}
    </div>
  );
}

// --- Ana Bileşen ---

export default function ProductCard({
  product,
  categories = [],
  isAdmin,
  onDelete,
  onUpdate,
  onOrderChange,
  orderIndex = 1,
  itemsInCategory = 1,
  activeDiscount,
}: ProductCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const descAreaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempDesc, setTempDesc] = useState(product.description || '');
  const [showActions, setShowActions] = useState(false);
  const [menuMode, setMenuMode] = useState<'main' | 'categories'>('main');
  const [menuDirection, setMenuDirection] = useState<'left' | 'right'>('right');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (isEditingDesc && descAreaRef.current) {
      descAreaRef.current.style.height = 'auto';
      descAreaRef.current.style.height = `${descAreaRef.current.scrollHeight}px`;
    }
  }, [tempDesc, isEditingDesc]);

  // Menü konumlandırma ve dışarı tıklama kontrolü
  useEffect(() => {
    const handleClickOutside = (ev: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(ev.target as Node)) {
        setIsEditingDesc(false);
        setShowActions(false);
        setMenuMode('main');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useLayoutEffect(() => {
    if (showActions && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      if (rect.right > window.innerWidth - 20) {
        setMenuDirection('left');
      } else {
        setMenuDirection('right');
      }
    }
  }, [showActions]);

  const handleImageClick = () => { if (isAdmin) fileInputRef.current?.click(); };
  const handleFileChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      const { compressImage } = await import('../utils/image');
      const compressedStr = await compressImage(file, 250, 0.6) as string;
      onUpdate(product.id, { image: compressedStr });
    } catch { alert('Görsel işlenemedi.'); }
    ev.target.value = '';
  };

  const updateField = (field: keyof Product, value: string | boolean | null) => {
    if (value !== (product[field] || '')) onUpdate(product.id, { [field]: value });
  };

  // İndirim Uygulama Mantığı
  const isDiscountActive = activeDiscount && (!activeDiscount.category || activeDiscount.category === product.category);
  const displayPrice = isDiscountActive ? calculateDiscount(product.price, activeDiscount.rate) : product.price;

  const nameClass = `${CT.nameFontSize} ${CT.nameWeight} ${CT.nameColor} ${CT.nameLeading}`;
  const priceColorClass = isDiscountActive ? DISCOUNT_UI.activeColor : CT.priceColor;
  const priceClass = `${CT.priceFontSize} ${CT.priceWeight} ${priceColorClass}`;
  const descClass = `${CT.descFontSize} ${CT.descColor} ${CT.descLeading}`;

  const finalImageUrl = getImageUrl(product.image);

  return (
    <article
      ref={cardRef as React.RefObject<HTMLDivElement>}
      data-product-id={product.id}
      className={`bg-white border ${product.inStock === false ? 'border-transparent bg-stone-50' : 'border-stone-200'} rounded-lg flex flex-col group hover:shadow-md transition-all duration-300 relative`}
    >
      {/* Sayısal Sıralama (Sağ Üst) */}
      {isAdmin && (
        <div className="absolute top-2 right-2 z-[25]">
          <select
            value={orderIndex}
            onChange={(e) => onOrderChange?.(product.id, parseInt(e.target.value, 10))}
            style={{ textAlignLast: 'center', padding: 0 }}
            className="appearance-none bg-white/90 backdrop-blur-sm text-stone-900 text-[11px] font-black w-7 h-7 rounded-lg shadow-lg border border-stone-200 text-center cursor-pointer hover:bg-white transition-all active:scale-90 focus:outline-none ring-2 ring-black/5"
          >
            {Array.from({ length: itemsInCategory }, (_, i) => (
              <option key={i + 1} value={i + 1} className="text-black">{i + 1}</option>
            ))}
          </select>
        </div>
      )}

      <div className={`relative w-full bg-stone-100 aspect-square flex items-center justify-center rounded-t-lg ${isAdmin ? 'cursor-pointer' : ''}`} onClick={handleImageClick}>
        {finalImageUrl && !imgError ? (
          <img src={finalImageUrl} alt={product.name} onError={() => setImgError(true)} className={`w-full h-full object-cover rounded-t-lg transition-all duration-300 ${product.inStock === false ? 'grayscale opacity-60' : ''}`} draggable={false} loading="lazy" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-stone-300 select-none"><span className="text-5xl">{PLACEHOLDER_EMOJI}</span></div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      <div className={`${CL.cardInfoPadding} flex flex-col gap-0.5 flex-grow`}>
        <MarqueeText text={product.name} textClass={`${nameClass} transition-all duration-300 ${product.inStock === false ? 'opacity-60 text-stone-500' : ''}`} isAdmin={isAdmin} editableProps={isAdmin ? { contentEditable: true, suppressContentEditableWarning: true, onBlur: (ev) => updateField('name', ev.currentTarget.textContent?.trim() || ''), onKeyDown: (ev) => ev.key === 'Enter' && (ev.preventDefault(), ev.currentTarget.blur()), className: 'cursor-text focus:outline-none focus:bg-amber-50 px-0.5 rounded' } : {}} />
        <div className="relative min-h-[24px]">
          {isAdmin ? (isEditingDesc ? (<textarea ref={descAreaRef} value={tempDesc} onChange={(ev) => setTempDesc(ev.target.value)} onBlur={() => (setIsEditingDesc(false), updateField('description', tempDesc.trim()))} className={`w-full ${descClass} bg-amber-50 border border-amber-200 rounded px-1 py-0.5 focus:outline-none resize-none overflow-hidden block`} autoFocus />) : (<div onClick={(ev) => (ev.stopPropagation(), setIsEditingDesc(true))} className={`w-full px-1 py-0.5 ${descClass} cursor-text hover:bg-amber-50 rounded transition-colors ${!product.description ? 'text-stone-300 italic' : ''}`}>{product.description || '+ Açıklama ekle'}</div>)) : (product.description && (<DescriptionScroll lines={product.description.split('\n').filter(Boolean)} lineClass={descClass} maxHeightClass={CT.descMaxHeight} />))}
        </div>
        <div className="mt-auto">
          <div
            contentEditable={isAdmin}
            suppressContentEditableWarning
            onBlur={(ev) => { let val = ev.currentTarget.textContent?.trim() || ''; if (val && !val.startsWith('₺')) val = '₺' + val; updateField('price', val); ev.currentTarget.textContent = val; }}
            onKeyDown={(ev) => ev.key === 'Enter' && (ev.preventDefault(), ev.currentTarget.blur())}
            className={`${priceClass} ${DISCOUNT_UI.transitionClass} ${isAdmin ? 'cursor-text focus:outline-none focus:bg-amber-50 px-0.5 rounded' : ''} ${product.inStock === false && !isAdmin ? 'line-through opacity-60 text-stone-500' : ''}`}
          >
            {displayPrice}
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className={`absolute ${CL.actionMenuAnchorB} ${CL.actionMenuAnchorR} z-20`}>
          {/* 3 Nokta Butonu */}
          <button 
            onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); setMenuMode('main'); }}
            className={`${CL.iconSmall} flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors active:scale-90`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 pointer-events-none">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
          </button>

          {/* Profesyonel Custom Menü */}
          {showActions && (
            <div 
              ref={menuRef}
              style={{ transformOrigin: menuDirection === 'right' ? 'top left' : 'top right' }}
              className={`absolute bottom-full ${menuDirection === 'right' ? 'left-0' : 'right-0'} mb-2 w-40 bg-white border border-stone-200 rounded-xl shadow-2xl py-1.5 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200`}
              onClick={(e) => e.stopPropagation()}
            >
              {menuMode === 'main' ? (
                <>
                  <button 
                    onClick={() => setMenuMode('categories')}
                    className="w-full text-left px-3 py-2 text-[11px] font-bold text-stone-700 hover:bg-stone-50 flex items-center justify-between group"
                  >
                    <span>KATEGORİ</span>
                    <span className="text-stone-300 group-hover:text-stone-500">→</span>
                  </button>
                  <button 
                    onClick={() => { onUpdate(product.id, { inStock: !product.inStock }); setShowActions(false); }}
                    className="w-full text-left px-3 py-2 text-[11px] font-bold text-stone-700 hover:bg-stone-50"
                  >
                    {product.inStock ? 'TÜKENDİ' : 'STOKTA'}
                  </button>
                  <button 
                    onClick={() => { onUpdate(product.id, { is_archived: !product.is_archived }); setShowActions(false); }}
                    className="w-full text-left px-3 py-2 text-[11px] font-bold text-stone-700 hover:bg-stone-50"
                  >
                    {product.is_archived ? 'YAYINLA' : 'ARŞİVLE'}
                  </button>
                  <div className="h-px bg-stone-100 my-1"></div>
                  <button 
                    onClick={() => { if(window.confirm('Silinsin mi?')) onDelete(product.id); setShowActions(false); }}
                    className="w-full text-left px-3 py-2 text-[11px] font-bold text-red-500 hover:bg-red-50"
                  >
                    SİL
                  </button>
                </>
              ) : (
                <div className="flex flex-col">
                  <button 
                    onClick={() => setMenuMode('main')}
                    className="w-full text-left px-3 py-1.5 text-[9px] font-black text-stone-400 hover:text-stone-600 bg-stone-50 border-b border-stone-100"
                  >
                    ← GERİ DÖN
                  </button>
                  <div className="max-h-48 overflow-y-auto py-1">
                    {categories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => { onUpdate(product.id, { category: cat }); setShowActions(false); }}
                        className={`w-full text-left px-3 py-2 text-[11px] font-semibold hover:bg-stone-50 ${product.category === cat ? 'text-kraft-600 bg-kraft-50' : 'text-stone-600'}`}
                      >
                        {cat}
                      </button>
                    ))}
                    <button 
                      onClick={() => {
                        const name = window.prompt('Yeni kategori adı:');
                        if (name?.trim()) onUpdate(product.id, { category: name.trim() });
                        setShowActions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-[11px] font-bold text-stone-900 border-t border-stone-100 bg-stone-50 hover:bg-stone-100"
                    >
                      + YENİ EKLE
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Durum İkonları */}
      <div className="absolute inset-0 z-[5] pointer-events-none rounded-lg flex items-center justify-center gap-2">
        {!product.inStock && (
          <div className="bg-stone-900/90 text-white w-8 h-8 rounded-full shadow-xl flex items-center justify-center -translate-y-4">
            ∅
          </div>
        )}
        {product.is_archived && (
          <div className="bg-stone-900/90 text-white w-8 h-8 rounded-full shadow-xl flex items-center justify-center -translate-y-4">
            📦
          </div>
        )}
      </div>
    </article>
  );
}
