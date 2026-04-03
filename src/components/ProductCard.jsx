import { useRef, useState, useEffect } from 'react';
import { CARD_TYPOGRAPHY as CT, CARD_LAYOUT as CL } from '../data/config';

// --- Yardımcı Bileşenler (Dahili) ---

// Yatay kayan metin (Ürün Adı için)
function MarqueeText({ text, textClass, isAdmin, editableProps = {} }) {
  const containerRef = useRef(null);
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
    <div
      ref={containerRef}
      className={`overflow-hidden ${isAdmin ? 'whitespace-normal' : 'whitespace-nowrap'} ${textClass} ${editableClass}`}
      {...restEditable}
    >
      {overflow && !isAdmin
        ? <span className="marquee-track inline-block">{text}&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;</span>
        : <span>{text}</span>
      }
    </div>
  );
}

// Dikey kayan açıklama satırları
function DescriptionScroll({ lines, lineClass, maxHeightClass }) {
  const containerRef = useRef(null);
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

  const renderLines = (keyPrefix) =>
    lines.map((line, i) => (
      <div key={`${keyPrefix}-${i}`} className={`${lineClass} flex gap-1 items-baseline`}>
        <span className="text-stone-400 shrink-0">•</span>
        <span>{line}</span>
      </div>
    ));

  return (
    <div ref={containerRef} className={`${maxHeightClass} overflow-hidden`}>
      {overflow ? (
        <div className="desc-scroll-track">
          {renderLines('a')}
          {renderLines('b')}
        </div>
      ) : renderLines('a')}
    </div>
  );
}

// --- Ana Bileşen ---

export default function ProductCard({ product, categories = [], isAdmin, onDelete, onUpdate }) {
  const fileInputRef = useRef(null);
  const cardRef = useRef(null);
  const descAreaRef = useRef(null);
  
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempDesc, setTempDesc] = useState(product.description || '');
  const [newCatData, setNewCatData] = useState('');
  const [showActions, setShowActions] = useState(false);

  // --- Sürükleme State'i (Kategori Popover için) ---
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Textarea otomatik boyutlandırma
  useEffect(() => {
    if (isEditingDesc && descAreaRef.current) {
      descAreaRef.current.style.height = 'auto';
      descAreaRef.current.style.height = `${descAreaRef.current.scrollHeight}px`;
    }
  }, [tempDesc, isEditingDesc]);

  // Dışarı tıklama kontrolü
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setIsEditingCategory(false);
        setIsEditingDesc(false);
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sürükleme mantığı
  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      setDragPos({ x: clientX - dragStartRef.current.x, y: clientY - dragStartRef.current.y });
    };
    const handleEnd = () => setIsDragging(false);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
    };
  }, [isDragging]);

  const handleDragStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = { x: clientX - dragPos.x, y: clientY - dragPos.y };
    setIsDragging(true);
  };

  // --- Handlers ---
  const handleImageClick = () => { if (isAdmin) fileInputRef.current?.click(); };
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { compressImage } = await import('../utils/image.js');
      const compressedStr = await compressImage(file, 600, 0.7);
      onUpdate(product.id, { image: compressedStr });
    } catch (err) { alert("Görsel işlenemedi."); }
    e.target.value = '';
  };

  const updateField = (field, value) => {
    if (value !== (product[field] || '')) onUpdate(product.id, { [field]: value });
  };

  // --- Render Helpers ---
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
  };

  const nameClass = `${CT.nameFontSize} ${CT.nameWeight} ${CT.nameColor} ${CT.nameLeading}`;
  const priceClass = `${CT.priceFontSize} ${CT.priceWeight} ${CT.priceColor}`;
  const descClass = `${CT.descFontSize} ${CT.descColor} ${CT.descLeading}`;
  const categoryClass = `inline-block ${CT.categoryFontSize} ${CT.categoryWeight} ${CT.categoryCase} ${CT.categoryTracking} ${CT.categoryColor} ${CT.categoryBg} ${CT.categoryBorder} ${CT.categoryRounding} ${CT.categoryPadding}`;

  return (
    <article ref={cardRef} className={`bg-white border ${product.inStock === false ? 'border-transparent bg-stone-50' : 'border-stone-200'} rounded-lg flex flex-col group hover:shadow-md transition-shadow duration-200 relative`}>
      
      {/* 1. IMAGE SECTION */}
      <div className={`relative w-full bg-stone-100 aspect-square flex items-center justify-center rounded-t-lg ${isAdmin ? 'cursor-pointer' : ''}`} onClick={handleImageClick}>
        {product.image
          ? <img src={getImageUrl(product.image)} alt={product.name} className={`w-full h-full object-cover rounded-t-lg transition-all duration-300 ${product.inStock === false ? 'grayscale opacity-60' : ''}`} draggable={false} loading="lazy" />
          : <div className="flex flex-col items-center gap-1 text-stone-300 select-none">
              <span className="text-5xl">📦</span>
            </div>
        }
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

        {/* Category Chip (Admin) */}
        {isAdmin && !isEditingCategory && (
          <button 
            onClick={(e) => { e.stopPropagation(); setIsEditingCategory(true); }}
            className={`absolute top-1.5 left-1.5 z-10 ${categoryClass} hover:ring-1 hover:ring-kraft-400`}
          >
            {product.category || 'KATEGORİSİZ'}
          </button>
        )}

        {/* Category Popover */}
        {isAdmin && isEditingCategory && (
          <div 
            style={{ transform: `translate(calc(-50% + ${dragPos.x}px), ${dragPos.y}px)` }}
            className={`absolute ${CL.catPopoverOffsetTop} left-1/2 z-50 bg-white border border-stone-200 rounded-lg ${CL.catPopoverWidth} shadow-2xl flex flex-col items-stretch overflow-hidden`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-3 pb-0 cursor-move bg-stone-50" onMouseDown={handleDragStart}>
              <span className="text-[10px] font-bold text-stone-600">Kategori Değiştir</span>
              <button onClick={() => setIsEditingCategory(false)} className="text-stone-400 hover:text-stone-700">×</button>
            </div>
            <div className="p-3 pt-1 bg-white">
              <div className="flex flex-wrap gap-1 mb-2 max-h-32 overflow-y-auto">
                {categories.map(cat => (
                  <button key={cat} onClick={() => { onUpdate(product.id, { category: cat }); setIsEditingCategory(false); }} className={`px-1.5 py-0.5 text-[9px] rounded-sm font-semibold border ${cat === product.category ? 'bg-kraft-100 text-kraft-800 border-kraft-300' : 'bg-stone-50 text-stone-600 border-stone-200'}`}>{cat}</button>
                ))}
              </div>
              <div className="flex gap-1">
                <input type="text" value={newCatData} onChange={e => setNewCatData(e.target.value)} placeholder="Yeni..." className="w-full border border-stone-300 rounded px-1.5 py-1 text-[10px] focus:outline-none focus:border-kraft-400" />
                <button onClick={() => { if(newCatData.trim()) { onUpdate(product.id, { category: newCatData.trim() }); setIsEditingCategory(false); } }} className="bg-stone-900 text-white px-2 py-0.5 rounded text-[10px] font-bold">+</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. INFO SECTION */}
      <div className={`${CL.cardInfoPadding} flex flex-col gap-0.5 flex-grow`}>
        <MarqueeText
          text={product.name}
          textClass={`${nameClass} transition-all duration-300 ${product.inStock === false ? 'opacity-60 text-stone-500' : ''}`}
          isAdmin={isAdmin}
          editableProps={isAdmin ? {
            contentEditable: true,
            suppressContentEditableWarning: true,
            onBlur: (e) => updateField('name', e.currentTarget.textContent.trim()),
            onKeyDown: (e) => e.key === 'Enter' && (e.preventDefault(), e.currentTarget.blur()),
            className: 'cursor-text focus:outline-none focus:bg-amber-50 px-0.5 rounded',
          } : {}}
        />

        <div className="relative min-h-[24px]">
          {isAdmin ? (
            isEditingDesc ? (
              <textarea
                ref={descAreaRef}
                value={tempDesc}
                onChange={(e) => setTempDesc(e.target.value)}
                onBlur={() => (setIsEditingDesc(false), updateField('description', tempDesc.trim()))}
                className={`w-full ${descClass} bg-amber-50 border border-amber-200 rounded px-1 py-0.5 focus:outline-none resize-none overflow-hidden block`}
                autoFocus
              />
            ) : (
              <div onClick={(e) => (e.stopPropagation(), setIsEditingDesc(true))} className={`w-full px-1 py-0.5 ${descClass} cursor-text hover:bg-amber-50 rounded transition-colors ${!product.description ? 'text-stone-300 italic' : ''}`}>
                {product.description || '+ Açıklama ekle'}
              </div>
            )
          ) : (
            product.description && <DescriptionScroll lines={product.description.split('\n').filter(Boolean)} lineClass={descClass} maxHeightClass={CT.descMaxHeight} />
          )}
        </div>

        <div className="mt-auto">
          <div
            contentEditable={isAdmin}
            suppressContentEditableWarning
            onBlur={(e) => {
              let val = e.currentTarget.textContent.trim();
              if (val && !val.startsWith('₺')) val = '₺' + val;
              updateField('price', val);
              e.currentTarget.textContent = val;
            }}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), e.currentTarget.blur())}
            className={`${priceClass} transition-all duration-300 ${isAdmin ? 'cursor-text focus:outline-none focus:bg-amber-50 px-0.5 rounded' : ''} ${product.inStock === false && !isAdmin ? 'line-through opacity-60 text-stone-500' : ''}`}
          >
            {product.price}
          </div>
        </div>
      </div>

      {/* 3. ACTION MENU (Admin Only) */}
      {isAdmin && (
        <div className={`absolute ${CL.actionMenuAnchorB} ${CL.actionMenuAnchorR} z-20`}>
          <button onClick={(e) => (e.stopPropagation(), setShowActions(!showActions))} className={`${CL.iconSmall} flex items-center justify-center rounded-full transition-colors ${showActions ? 'bg-stone-200 text-stone-900' : 'text-stone-300 hover:bg-stone-100 hover:text-stone-700'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>
          </button>
          
          {showActions && (
            <div className={`absolute ${CL.actionPopoverOffsetB} left-1/2 -translate-x-1/2 z-40 bg-white border border-stone-200 rounded-full shadow-2xl px-1.5 py-1.5 flex items-center ${CL.gapSmall}`} onClick={e => e.stopPropagation()}>
              <button onClick={() => (onUpdate(product.id, { inStock: !product.inStock }), setShowActions(false))} className={`${CL.iconMedium} flex items-center justify-center rounded-full ${!product.inStock ? 'bg-stone-900 text-white' : 'text-stone-400 hover:bg-stone-100 hover:text-stone-700'}`} title="Stok Durumu"><span className="text-xl font-light">∅</span></button>
              <button onClick={() => (onUpdate(product.id, { is_archived: !product.is_archived }), setShowActions(false))} className={`${CL.iconMedium} flex items-center justify-center rounded-full ${product.is_archived ? 'bg-stone-900 text-white' : 'text-stone-400 hover:bg-stone-100 hover:text-stone-700'}`} title="Arşivle"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg></button>
              <div className="w-px h-4 bg-stone-200 mx-0.5"></div>
              <button onClick={(e) => (setShowActions(false), window.confirm('Silinsin mi?') && onDelete(product.id))} className={`${CL.iconMedium} flex items-center justify-center rounded-full text-red-500 hover:bg-red-50`} title="Sil"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
            </div>
          )}
        </div>
      )}

      {/* 4. OVERLAYS */}
      <div className="absolute inset-0 z-[5] pointer-events-none rounded-lg flex items-center justify-center gap-2">
        {(!product.inStock || product.is_archived) && (
          <div className="bg-stone-900/90 text-white w-8 h-8 rounded-full shadow-xl flex items-center justify-center -translate-y-4">
            {product.is_archived ? '📦' : '∅'}
          </div>
        )}
      </div>
    </article>
  );
}
