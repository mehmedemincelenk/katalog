import { useState } from 'react';

// SearchFilter: real-time search box + dynamic category chips
export default function SearchFilter({ products, search, onSearchChange, activeCategories = [], onCategoryToggle, isAdmin, renameCategory, removeCategoryFromProducts }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const categories = ['Tümü', ...new Set(products.map((p) => p.category).filter(Boolean))];

  return (
    <section className="bg-white border-b border-stone-200 py-3 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 sm:flex-none sm:w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z" />
            </svg>
          </span>
          <input
            id="product-search"
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Ürün ara…"
            className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-md text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-kraft-400 focus:border-kraft-400 transition"
          />
        </div>

        {/* Mobile: Filter Menu Toggle Button */}
        <button
          className={`sm:hidden p-2 border rounded-md flex-shrink-0 flex items-center justify-center transition-colors ${isDropdownOpen ? 'bg-stone-900 text-white border-stone-900' : 'text-stone-600 border-stone-300 hover:bg-stone-50'}`}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          title="Kategorileri Menüsü"
        >
          {isDropdownOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Desktop: Horizontal Scrollable Chips */}
        <div className="hidden sm:flex overflow-x-auto whitespace-nowrap gap-2 items-center flex-1 no-scrollbar pb-1">
          {categories.map((cat) => {
            const isActive = cat === 'Tümü' ? activeCategories.length === 0 : activeCategories.includes(cat);
            return (
              <div key={cat} className="group flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => !isAdmin && onCategoryToggle(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-150 ${
                    isActive && !isAdmin ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-300 hover:border-stone-500 hover:text-stone-900'
                  } ${isAdmin ? 'cursor-text bg-amber-50' : ''}`}
                  contentEditable={isAdmin}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (isAdmin) {
                      const newName = e.currentTarget.textContent.trim();
                      if (newName && newName !== cat) {
                        renameCategory(cat, newName);
                        if (activeCategories.includes(cat)) onCategoryToggle('Tümü');
                      }
                      if (!newName) e.currentTarget.textContent = cat;
                    }
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                >
                  {cat}
                </button>
                {isAdmin && cat !== 'Tümü' && (
                  <button onClick={() => { window.confirm(`Silinsin mi?`) && removeCategoryFromProducts(cat); if (activeCategories.includes(cat)) onCategoryToggle('Tümü'); }} className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs" title="Kategoriyi Sil">×</button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: Dropdown Absolute Menu */}
      {isDropdownOpen && (
        <>
          <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setIsDropdownOpen(false)} />
          <div className="absolute top-full left-0 w-full bg-stone-50 border-b border-stone-200 shadow-xl p-4 z-50 sm:hidden">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isActive = cat === 'Tümü' ? activeCategories.length === 0 : activeCategories.includes(cat);
                return (
                  <div key={cat} className="group flex items-center gap-1">
                    <button
                      onClick={() => { if(!isAdmin) { onCategoryToggle(cat); } }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-150 shadow-sm ${
                      isActive && !isAdmin ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-300'
                    } ${isAdmin ? 'cursor-text bg-amber-50' : ''}`}
                    contentEditable={isAdmin}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      if (isAdmin) {
                        const newName = e.currentTarget.textContent.trim();
                        if (newName && newName !== cat) renameCategory(cat, newName);
                        if (!newName) e.currentTarget.textContent = cat;
                      }
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                  >
                    {cat}
                  </button>
                  {isAdmin && cat !== 'Tümü' && (
                    <button onClick={() => { removeCategoryFromProducts(cat); }} className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">×</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        </>
      )}
    </section>
  );
}
