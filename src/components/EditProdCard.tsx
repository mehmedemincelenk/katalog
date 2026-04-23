import { memo, useEffect, useState, useRef } from 'react';
import Button from './Button';
import BaseModal from './BaseModal';
import StatusToggle from './StatusToggle';
import Loading from './Loading';
import {
  Trash2,
  Download,
  ImageIcon,
  Camera,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

import { EditProdCardProps } from '../types';
import { useScrollLock } from '../hooks/useUI';
import { downloadImage } from '../utils/image';

/**
 * EDIT PRODUCT CARD COMPONENT (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Specialized admin dashboard with high-density unified management hub.
 * Refactored for 100% autonomy in image management and state sync.
 */
export const EditProdCard = memo(
  ({
    product,
    categories = [],
    onDelete,
    onUpdate,
    onImageUpload,
    isOpen,
    setIsOpen,
  }: EditProdCardProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<
      'PRODUCT' | 'IMAGE' | null
    >(null);
    const [isUploading, setIsUploading] = useState(false);

    // Diamond Sync: Manage background interactions
    useScrollLock(isOpen);

    // Reset local states when modal closes
    useEffect(() => {
      if (!isOpen) {
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
        setIsUploading(false);
      }
    }, [isOpen]);

    const handleImageFileChange = async (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const selectedFile = event.target.files?.[0];
      if (!selectedFile || !onImageUpload) return;

      setIsUploading(true);
      try {
        await onImageUpload(product.id, selectedFile);
      } catch (err) {
        console.error('Upload failed', err);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    const handleDownload = () => {
      const targetUrl = product.polished_image_url || product.image_url;
      if (!targetUrl) return;

      const hqUrl = !product.polished_image_url
        ? targetUrl.replace('/lq/', '/hq/').split('?')[0]
        : targetUrl;

      const cleanName = product.name.replace(/\s+/g, '-').toLowerCase();
      downloadImage(hqUrl, `diamond-${cleanName}.png`);
    };

    const handleAction = (
      type: 'ARCHIVE' | 'STOCK' | 'DOWNLOAD' | 'CATEGORY',
      value?: string | boolean,
    ) => {
      if (type === 'ARCHIVE') onUpdate(product.id, { is_archived: !!value });
      else if (type === 'STOCK') onUpdate(product.id, { out_of_stock: !value });
      else if (type === 'DOWNLOAD') handleDownload();
      else if (type === 'CATEGORY' && typeof value === 'string')
        onUpdate(product.id, { category: value });
    };

    const finalizeDelete = () => {
      if (deleteTarget === 'PRODUCT') {
        onDelete(product.id);
        setIsOpen(false);
      } else if (deleteTarget === 'IMAGE') {
        onUpdate(product.id, { image_url: '' });
      }
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    };

    const modalHeader = (
      <div className="flex flex-col text-left overflow-hidden">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-900 leading-none">
          Ürünü Yönet
        </h3>
        <span className="text-[11px] font-bold text-stone-400 mt-1.5 truncate pr-8">
          {product.name}
        </span>
      </div>
    );

    const modalFooter = (
      <Button
        onClick={() => setIsOpen(false)}
        variant="primary"
        mode="rectangle"
        className="w-full !rounded-xl !py-4 font-black text-stone-900 uppercase tracking-widest"
      >
        KAYDET
      </Button>
    );

    return (
      <>
        <BaseModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={modalHeader}
          footer={modalFooter}
          maxWidth="max-w-md"
          className="!rounded-[2rem]"
        >
          <div className="py-2 flex flex-col gap-4">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageFileChange}
            />

            {/* UNIFIED MANAGEMENT HUB */}
            <div className="bg-stone-50 p-4 rounded-[1.5rem] border border-stone-100 flex gap-4 items-stretch relative overflow-hidden">
              {/* LEFT: MEDIA HUB */}
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`w-[130px] aspect-square relative group rounded-xl overflow-hidden bg-white border border-stone-100 flex items-center justify-center shrink-0 cursor-pointer hover:border-stone-300 transition-all shadow-sm ${isUploading ? 'opacity-50' : ''}`}
              >
                {product.polished_image_url || product.image_url ? (
                  <>
                    <img
                      src={
                        (product.polished_image_url || product.image_url) ??
                        undefined
                      }
                      alt="Preview"
                      className="w-full h-full object-contain p-1"
                    />
                    <div className="absolute inset-x-0 bottom-0 py-1.5 bg-black/40 backdrop-blur-sm text-white text-[8px] font-black uppercase text-center translate-y-full group-hover:translate-y-0 transition-transform flex items-center justify-center gap-1">
                      <Camera size={10} /> Değiştir
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center opacity-30 group-hover:opacity-60 transition-opacity">
                    <ImageIcon size={32} />
                    <span className="text-[9px] font-black mt-2 uppercase">
                      Görsel Seç
                    </span>
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20">
                    <Loading size="sm" variant="dark" label="" />
                  </div>
                )}
              </div>

              {/* RIGHT: COMPACT CONTROLS */}
              <div className="flex-1 flex flex-col justify-between gap-1.5">
                <StatusToggle
                  label="Stokta Var mı?:"
                  value={!product.out_of_stock}
                  onChange={(val) => handleAction('STOCK', val)}
                />

                <StatusToggle
                  label="Yayın Durumu:"
                  value={!product.is_archived}
                  onChange={(val) => handleAction('ARCHIVE', !val)}
                />

                {/* ACTION ROW: DOWNLOAD & DELETE */}
                <div className="grid grid-cols-2 gap-1.5 mt-auto">
                  <Button
                    onClick={() => handleAction('DOWNLOAD')}
                    variant="secondary"
                    mode="rectangle"
                    size="sm"
                    className="!py-1.5 !text-[8px] font-black uppercase shadow-sm border-stone-100"
                    icon={<Download size={10} />}
                  >
                    İndir
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setDeleteTarget(null);
                    }}
                    variant="secondary"
                    mode="rectangle"
                    size="sm"
                    className="!py-1.5 !text-[8px] font-black uppercase shadow-sm border-stone-100 hover:!text-red-600 hover:!border-red-100"
                    icon={<Trash2 size={10} />}
                  >
                    Sil
                  </Button>
                </div>
              </div>
            </div>

            {/* CATEGORY SELECTOR */}
            <div className="space-y-3 border-t border-stone-100/60 pt-4">
              <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest px-1">
                Kategori Bilgisi
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(categories || []).map((categoryName) => (
                  <Button
                    key={categoryName}
                    onClick={() => handleAction('CATEGORY', categoryName)}
                    variant={
                      product.category === categoryName
                        ? 'primary'
                        : 'secondary'
                    }
                    mode="rectangle"
                    size="sm"
                    className="!text-[10px] !py-1.5 !px-3 font-black"
                  >
                    {categoryName}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </BaseModal>

        {/* 2-STEP DELETE CONFIRM MODAL */}
        <BaseModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
          }}
          maxWidth="max-w-sm"
        >
          {!deleteTarget ? (
            <div className="flex flex-col gap-3 py-4 px-4">
              <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 text-center">
                Silme Seçenekleri
              </h3>
              <Button
                onClick={() => setDeleteTarget('PRODUCT')}
                variant="danger"
                mode="rectangle"
                className="w-full !py-4 font-black"
              >
                ÜRÜNÜ TAMAMEN SİL
              </Button>
              <Button
                onClick={() => setDeleteTarget('IMAGE')}
                variant="secondary"
                mode="rectangle"
                className="w-full !py-4 font-black"
              >
                SADECE GÖRSELİ KALDIR
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="ghost"
                mode="rectangle"
                className="w-full py-2 font-black text-stone-400 text-[10px] mt-2"
              >
                İPTAL
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center space-y-6 py-6 px-4">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-inner animate-in zoom-in duration-300">
                <AlertCircle size={32} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight">
                  EMİN MİSİNİZ?
                </h3>
                <p className="text-xs font-bold text-stone-400 px-4">
                  {deleteTarget === 'PRODUCT'
                    ? 'Bu ürün dükkandan tamamen kaldırılacak.'
                    : 'Ürünün görseli silinecek, ürün dükkanda kalmaya devam edecek.'}
                  <br />
                  Bu işlem geri alınamaz.
                </p>
              </div>

              <div className="w-full flex flex-col gap-3 pt-2">
                <Button
                  onClick={finalizeDelete}
                  variant="danger"
                  mode="rectangle"
                  className="w-full !py-4 font-black shadow-lg shadow-red-200"
                >
                  EVET, SİL
                </Button>
                <Button
                  onClick={() => setDeleteTarget(null)}
                  variant="ghost"
                  mode="rectangle"
                  className="w-full !text-stone-500 hover:!text-stone-900 !text-[10px] font-black uppercase py-2"
                  icon={<ArrowLeft size={14} />}
                >
                  Geri Dön
                </Button>
              </div>
            </div>
          )}
        </BaseModal>
      </>
    );
  },
);

export default EditProdCard;
