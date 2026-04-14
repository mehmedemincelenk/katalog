import { useRef, useState, useEffect, memo } from 'react';
import { LABELS, THEME } from '../data/config';
import { Product } from '../types';
import Button from './Button';

interface AdminActionMenuProps {
  product: Product;
  categories: string[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, changes: Partial<Product>) => void;
}

/**
 * ADMIN ACTION MENU COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * Product management interface. Fully managed via THEME tokens.
 */
export const AdminActionMenu = memo(({ 
  product, categories, onDelete, onUpdate 
}: AdminActionMenuProps) => {
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const [isDropdownVisible, setIsDropdownViewVisible] = useState(false);
  const [currentMenuView, setCurrentMenuView] = useState<'main' | 'categories'>('main');
  
  const adminLabels = LABELS.adminActions;
  const theme = THEME.productCard;
  const globalColors = THEME.colors;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
        setIsDropdownViewVisible(false);
      }
    };
    if (isDropdownVisible) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isDropdownVisible]);

  const executeActionAndClose = (action: () => void) => { 
    action(); 
    setIsDropdownViewVisible(false); 
  };

  const downloadHighQualityImage = async () => {
    if (!product.image) return;
    try {
      const highQualityUrl = product.image.replace('/lq/', '/hq/').split('?')[0];
      const response = await fetch(highQualityUrl);
      const blob = await response.blob();
      const localUrl = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = localUrl;
      downloadLink.download = `hq-${product.name.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      window.URL.revokeObjectURL(localUrl);
      document.body.removeChild(downloadLink);
    } catch (error) {
      alert('Resim indirilemedi.');
    }
  };

  const handleNativeSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    if (!selectedValue) return;
    
    if (selectedValue === 'DELETE') { 
      if (window.confirm(adminLabels.confirmDelete)) onDelete(product.id); 
    }
    else if (selectedValue === 'ARCHIVE') onUpdate(product.id, { is_archived: !product.is_archived });
    else if (selectedValue === 'STOCK') onUpdate(product.id, { inStock: !product.inStock });
    else if (selectedValue === 'DOWNLOAD') downloadHighQualityImage();
    else if (selectedValue.startsWith('CAT:')) onUpdate(product.id, { category: selectedValue.replace('CAT:', '') });
    
    event.target.value = "";
  };

  return (
    <div className={theme.adminMenu.container}>
      {/* DESKTOP VIEW */}
      <div className="hidden lg:block relative" ref={menuContainerRef}>
        <Button 
          onClick={() => setIsDropdownViewVisible(!isDropdownVisible)}
          icon={THEME.icons.dots}
          variant="secondary"
          size="xs"
          mode="rectangle"
          className={theme.adminMenu.toggleButton}
        />
        {isDropdownVisible && (
          <div className={`${theme.adminMenu.dropdown} ${THEME.radius.card}`}>
            <div className="flex flex-col">
              {currentMenuView === 'main' ? (
                <>
                  <button 
                    onClick={() => setCurrentMenuView('categories')} 
                    className={`${theme.adminMenu.item} ${theme.typography.categoryBadge} ${theme.adminMenu.itemText} flex items-center justify-between`}
                  >
                    <span>{adminLabels.categories}</span> 🏷️
                  </button>
                  <button 
                    onClick={() => executeActionAndClose(() => onUpdate(product.id, { inStock: !product.inStock }))} 
                    className={`${theme.adminMenu.item} ${theme.typography.categoryBadge} ${theme.adminMenu.itemText}`}
                  >
                    {product.inStock ? '❌ ' + adminLabels.outOfStock : '✅ ' + adminLabels.inStock}
                  </button>
                  {product.image && (
                    <button 
                      onClick={() => executeActionAndClose(downloadHighQualityImage)} 
                      className={`${theme.adminMenu.item} ${theme.typography.categoryBadge} ${theme.adminMenu.itemText}`}
                    >
                      🖼️ HQ RESMİ İNDİR
                    </button>
                  )}
                  <button 
                    onClick={() => executeActionAndClose(() => onUpdate(product.id, { is_archived: !product.is_archived }))} 
                    className={`${theme.adminMenu.item} ${theme.typography.categoryBadge} ${theme.adminMenu.itemText}`}
                  >
                    {product.is_archived ? '📤 ' + adminLabels.publish : '📦 ' + adminLabels.archive}
                  </button>
                  <button 
                    onClick={() => { if(window.confirm(adminLabels.confirmDelete)) executeActionAndClose(() => onDelete(product.id)); }} 
                    className={`${theme.adminMenu.item} ${theme.typography.categoryBadge} ${globalColors.danger}`}
                  >
                    🗑️ {adminLabels.delete}
                  </button>
                </>
              ) : (
                <div className="flex flex-col">
                  <button onClick={() => setCurrentMenuView('main')} className={`${theme.adminMenu.backBtn}`}>
                    <span className="w-4 h-4 flex items-center justify-center">{THEME.icons.back}</span>
                    {LABELS.backBtn}
                  </button>
                  <div className={theme.adminMenu.categoryListWrapper}>
                    {categories.map(categoryName => (
                      <button 
                        key={categoryName} 
                        onClick={() => executeActionAndClose(() => onUpdate(product.id, { category: categoryName }))} 
                        className={`
                          ${theme.adminMenu.item} text-[11px] font-bold 
                          ${product.category === categoryName ? theme.adminMenu.categoryActive : theme.adminMenu.categoryInactive}
                        `}
                      >
                        {categoryName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MOBILE VIEW (Apple Touch Standards) */}
      <div className={`${theme.adminMenu.mobileToggle} ${THEME.radius.badge}`}>
        <span className={`pointer-events-none ${theme.adminMenu.mobileIconColor}`}>{THEME.icons.dots}</span>
        <select onChange={handleNativeSelectChange} value="" className={theme.orderSelect.select}>
          <option value="" disabled>Seç...</option>
          <optgroup label="--- İŞLEMLER ---">
            <option value="STOCK">{product.inStock ? '❌ ' + adminLabels.outOfStock : '✅ ' + adminLabels.inStock}</option>
            {product.image && <option value="DOWNLOAD">🖼️ HQ RESMİ İNDİR</option>}
            <option value="ARCHIVE">{product.is_archived ? '📤 ' + adminLabels.publish : '📦 ' + adminLabels.archive}</option>
            <option value="DELETE">🗑️ {adminLabels.delete}</option>
          </optgroup>
          <optgroup label="--- REYON DEĞİŞTİR ---">
            {categories.map(categoryName => (<option key={categoryName} value={`CAT:${categoryName}`} disabled={product.category === categoryName}>{categoryName}</option>))}
          </optgroup>
        </select>
      </div>
    </div>
  );
});
