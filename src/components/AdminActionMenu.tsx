import { memo } from 'react';
import { createPortal } from 'react-dom';
import { LABELS, THEME } from '../data/config';
import { Product } from '../types';
import Button from './Button';
import { Trash2, Smartphone, Archive, X, Download, RotateCcw, Image as ImageIcon } from 'lucide-react';

interface AdminActionMenuProps {
  product: Product;
  categories: string[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, changes: Partial<Product>) => void;
  onImageChangeClick?: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

/**
 * ADMIN ACTION MENU COMPONENT (Diamond Edition)
 * -----------------------------------------------------------
 * Re-imagined product management with segmented controls and media hub.
 */
export const AdminActionMenu = memo(({ 
  product, categories, onDelete, onUpdate, onImageChangeClick, isOpen, setIsOpen
}: AdminActionMenuProps) => {
  const adminLabels = LABELS.adminActions;
  const modalTheme = THEME.addProductModal;
  const globalIcons = THEME.icons;

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
    } catch {
      alert(LABELS.saveError);
    }
  };

  const handleAction = (type: 'DELETE' | 'ARCHIVE' | 'STOCK' | 'DOWNLOAD' | 'CATEGORY', value?: any) => {
    if (type === 'DELETE') { 
      if (window.confirm(adminLabels.confirmDelete)) {
        onDelete(product.id);
        setIsOpen(false);
      }
    }
    else if (type === 'ARCHIVE') onUpdate(product.id, { is_archived: value });
    else if (type === 'STOCK') onUpdate(product.id, { inStock: value });
    else if (type === 'DOWNLOAD') downloadHighQualityImage();
    else if (type === 'CATEGORY' && value) onUpdate(product.id, { category: value });
  };

  return createPortal(
    <>
      {/* ACTION MODAL OVERLAY */}
      {isOpen && (
        <div className={modalTheme.overlay} onClick={() => setIsOpen(false)} style={{ zIndex: 1000 }}>
          <div 
            className={`${modalTheme.container} max-w-[340px] p-0 overflow-hidden animate-in zoom-in-95 duration-200 border-none shadow-[0_30px_100px_rgba(0,0,0,0.3)]`} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER WITH TRASH ACTION */}
            <div className="bg-stone-50 border-b border-stone-100 px-5 py-4 flex items-center justify-between">
              <div className="flex flex-col text-left">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-900 leading-none">Ürünü Yönet</h3>
                <span className="text-[11px] font-bold text-stone-400 mt-1.5 truncate max-w-[160px]">{product.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  onClick={() => handleAction('DELETE')}
                  icon={<Trash2 size={16} />}
                  variant="danger"
                  size="sm"
                  mode="circle"
                  className="!w-9 !h-9 shadow-md"
                />
                <Button 
                  onClick={() => setIsOpen(false)}
                  icon={<X size={18} />}
                  variant="secondary"
                  size="sm"
                  mode="circle"
                  className="!w-9 !h-9 shadow-sm"
                />
              </div>
            </div>

            <div className="p-5 space-y-6">
              
              {/* MEDIA HUB */}
              <div className="space-y-3">
                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest px-1">Görsel Yönetimi</label>
                <div className="relative group rounded-2xl overflow-hidden bg-stone-50 aspect-video border border-stone-100 flex items-center justify-center">
                  {product.image ? (
                    <img src={product.image} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center opacity-20">
                       <ImageIcon size={32} />
                       <span className="text-[10px] font-black mt-2">GÖRSEL YOK</span>
                    </div>
                  )}
                  
                  {/* FLOATING MEDIA BAR */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur shadow-2xl rounded-xl p-1 flex items-center gap-1 border border-white/20">
                    <button 
                      onClick={() => { setIsOpen(false); onImageChangeClick?.(); }}
                      className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-600"
                      title="Değiştir"
                    >
                      <RotateCcw size={16} />
                    </button>
                    {product.image && (
                      <>
                        <button 
                          onClick={() => downloadHighQualityImage()}
                          className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-600"
                          title="İndir"
                        >
                          <Download size={16} />
                        </button>
                        <button 
                          onClick={() => { if(window.confirm('Görseli kaldırmak istediğinize emin misiniz?')) onUpdate(product.id, { image: '' }); }}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                          title="Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* SEGMENTED STATUS CONTROLS */}
              <div className="grid grid-cols-1 gap-4">
                 {/* STOCK CONTROL */}
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest px-1">Stok Durumu</label>
                    <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl gap-1">
                       <button 
                          onClick={() => handleAction('STOCK', true)}
                          className={`py-2 text-[10px] font-black rounded-lg transition-all ${product.inStock ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                       >
                          STOKTA VAR
                       </button>
                       <button 
                          onClick={() => handleAction('STOCK', false)}
                          className={`py-2 text-[10px] font-black rounded-lg transition-all ${!product.inStock ? 'bg-stone-900 text-white shadow-lg' : 'text-stone-400 hover:text-stone-600'}`}
                       >
                          TÜKENDİ
                       </button>
                    </div>
                 </div>

                 {/* ARCHIVE CONTROL */}
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest px-1">Yayın Durumu</label>
                    <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl gap-1">
                       <button 
                          onClick={() => handleAction('ARCHIVE', false)}
                          className={`py-2 text-[10px] font-black rounded-lg transition-all ${!product.is_archived ? 'bg-emerald-500 text-white shadow-lg' : 'text-stone-400 hover:text-stone-600'}`}
                       >
                          YAYINDA
                       </button>
                       <button 
                          onClick={() => handleAction('ARCHIVE', true)}
                          className={`py-2 text-[10px] font-black rounded-lg transition-all ${product.is_archived ? 'bg-stone-900 text-white shadow-lg' : 'text-stone-400 hover:text-stone-600'}`}
                       >
                          ARŞİVDE
                       </button>
                    </div>
                 </div>
              </div>

              {/* CATEGORY SELECTOR */}
              <div className="space-y-2 border-t border-stone-100 pt-5">
                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest px-1">Reyon Bilgisi</label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(categoryName => (
                    <button 
                      key={categoryName}
                      onClick={() => handleAction('CATEGORY', categoryName)}
                      className={`
                        text-[10px] font-black px-3 py-1.5 rounded-lg border transition-all
                        ${product.category === categoryName 
                          ? 'bg-stone-900 text-white border-stone-900 shadow-md' 
                          : 'bg-white text-stone-500 border-stone-100 hover:border-stone-300'}
                      `}
                    >
                      {categoryName}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-4 bg-stone-50 border-t border-stone-100">
              <Button 
                onClick={() => setIsOpen(false)}
                variant="primary"
                mode="rectangle"
                className="w-full !rounded-xl !py-3 font-black text-stone-900 uppercase"
              >
                İşlemi Tamamla
              </Button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
});
