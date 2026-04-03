import { useState } from 'react';
import { sortCategories } from '../data/config';

// --- Alt Bileşenler (Dahili) ---

function AdminCategoryItem({ cat, onDragStart, onDragEnd, onDragOver, onDrop, onRename, onDelete }) {
  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, cat)}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOverInternal}
      onDrop={(e) => onDrop(e, cat)}
      className="flex items-center gap-2 p-2 bg-amber-50/50 border border-amber-100 rounded-lg hover:border-amber-300 transition-all cursor-move group"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-300 group-hover:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" /></svg>
      <span
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          const newName = e.currentTarget.textContent.trim();
          if (newName && newName !== cat) onRename(cat, newName);
          if (!newName) e.currentTarget.textContent = cat;
        }}
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), e.currentTarget.blur())}
        className="flex-1 text-sm font-semibold text-stone-800 focus:outline-none"
      >
        {cat}
      </span>
      <button onClick={() => window.confirm(`${cat} silinsin mi?`) && onDelete(cat)} className="text-red-400 hover:text-red-600 px-2 font-bold text-lg">×</button>
    </div>
  );
}

function handleDragOverInternal(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

// --- Ana Bileşen ---

export default function SearchFilter({ 
  products, 
  categoryOrder,
  updateCategoryOrder,
  search, 
  onSearchChange, 
  activeCategories = [], 
  onCategoryToggle, 
  isAdmin, 
  renameCategory, 
  removeCategoryFromProducts 
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  const dynamicCategories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const sortedList = sortCategories(dynamicCategories, categoryOrder);
  const categories = ['Tümü', ...sortedList];

  const handleDragStart = (e, category) => {
    if (!isAdmin || category === 'Tümü') return;
    setDraggedItem(category);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.4';
  };

  const handleDrop = (e, targetCategory) => {
    if (!isAdmin || !draggedItem || draggedItem === targetCategory || targetCategory === 'Tümü') return;
    const newOrder = [...categoryOrder];
    const draggedIdx = newOrder.indexOf(draggedItem);
    const targetIdx = newOrder.indexOf(targetCategory);
    if (draggedIdx !== -1 && targetIdx !== -1) {
      newOrder.splice(draggedIdx, 1);
      newOrder.splice(targetIdx, 0, draggedItem);
      updateCategoryOrder(newOrder);
    }
  };

  return (
    <section className="bg-white border-b border-stone-200 py-3 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        
        {/* Search Row */}
        <div className="flex w-full sm:w-auto items-center gap-2 shrink-0">
          <div className="relative flex-1 sm:w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z" /></svg>
            </span>
            <input type="search" value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Ürün ara…" className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-md text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-kraft-400" />
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="sm:hidden flex items-center gap-1.5 px-3 py-2 bg-stone-100 border border-stone-300 rounded-md text-[10px] font-bold text-stone-700">
            <span>{isMenuOpen ? '✕' : '📂'}</span> Kategoriler
          </button>
        </div>

        {/* View Section */}
        <div className={`${isMenuOpen ? 'flex' : 'hidden'} sm:flex flex-wrap gap-2 items-center flex-1 transition-all w-full`}>
          {isAdmin ? (
            <div className="flex flex-col w-full gap-1 mt-2">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 px-1">Reyon Sıralaması</p>
              {categories.map((cat) => {
                if (cat === 'Tümü') return null;
                return <AdminCategoryItem 
                  key={cat} 
                  cat={cat} 
                  onDragStart={handleDragStart} 
                  onDragEnd={(e) => e.target.style.opacity = '1'}
                  onDrop={handleDrop}
                  onRename={renameCategory}
                  onDelete={removeCategoryFromProducts}
                />
              })}
            </div>
          ) : (
            categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryToggle(cat)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-semibold border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  (cat === 'Tümü' ? activeCategories.length === 0 : activeCategories.includes(cat))
                    ? 'bg-stone-900 text-white border-stone-900 shadow-md scale-105' 
                    : 'bg-white text-stone-600 border-stone-300 hover:border-stone-500'
                }`}
              >
                {cat}
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
