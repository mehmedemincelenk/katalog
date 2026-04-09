import React, { useState, useEffect, memo } from 'react';
import { UI, TECH, LABELS, MODAL } from '../data/config';
import { Product } from '../types';

/**
 * ADD PRODUCT MODAL (GİRİŞİMCİ ANALİZİ)
 * ----------------------------------
 * Bir kurucu olarak bu bileşen, envanterini dijital dünyaya taşıyan "Fabrika Giriş" kapındır.
 * 
 * 1. Veri Kalitesi: Zorunlu alanlar (*) ve resim seçimi ile Sheets'in temiz kalmasını sağlar.
 * 2. Hız: "Yeni Kategori" yazma özelliği ile admin panelinde vakit kaybetmeden ürün eklemeni sağlar.
 * 3. Optimizasyon: Yüklediğin fotoğrafları arka planda otomatik küçülterek Sheets limitlerini korur.
 */

interface AddProductModalProps {
  isOpen: boolean;
  categories: string[];
  onAdd: (product: Omit<Product, 'id' | 'is_archived'>) => void;
  onClose: () => void;
}

const EMPTY_FORM = {
  name: '',
  category: '',
  newCategory: '',
  price: '',
  description: '',
  image: null as string | null,
  inStock: true,
};

// --- YARDIMCI BİLEŞENLER (Atomik Tasarım) ---

/**
 * FormInput: Tek tip, şık ve standart giriş kutusu.
 */
const FormInput = memo(({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="block text-xs font-semibold text-stone-600 mb-1">{label}</label>
    <input
      {...props}
      className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kraft-400 transition outline-none"
    />
  </div>
));

/**
 * ImagePicker: Fotoğraf yükleme ve önizleme alanı.
 */
const ImagePicker = memo(({ previewUrl, onFileChange }: { previewUrl: string | null, onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="w-20 h-20 shrink-0 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden shadow-inner">
      {previewUrl ? (
        <img src={previewUrl} alt={LABELS.form.preview} className="w-full h-full object-cover" />
      ) : (
        <span className="text-3xl text-stone-300">📷</span>
      )}
    </div>
    <label className="cursor-pointer text-xs font-bold text-kraft-700 hover:text-kraft-900 transition-colors border border-kraft-200 px-4 py-1.5 rounded-full bg-kraft-50/50 uppercase tracking-tight">
      {LABELS.form.selectImage}
      <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
    </label>
  </div>
));

/**
 * CategorySelector: Mevcut kategorileri seçmeni veya yenisini oluşturmanı sağlayan akıllı alan.
 */
const CategorySelector = memo(({ categories, selected, newCategory, onSelect, onNewCategoryChange }: { 
  categories: string[], 
  selected: string, 
  newCategory: string,
  onSelect: (cat: string) => void,
  onNewCategoryChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => (
  <div>
    <label className="block text-xs font-semibold text-stone-600 mb-2">{LABELS.form.category}</label>
    {categories.length > 0 && (
      <div className="flex flex-wrap gap-1.5 mb-3">
        {categories.map((cat) => (
          <button 
            key={cat} 
            type="button" 
            onClick={() => onSelect(cat)} 
            className={`px-3 py-1 text-[10px] font-bold rounded-full border transition-all ${selected === cat && !newCategory ? 'bg-stone-900 text-white border-stone-900 shadow-md' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'}`}
          >
            {cat}
          </button>
        ))}
      </div>
    )}
    <input 
      name="newCategory" 
      type="text" 
      value={newCategory} 
      onChange={onNewCategoryChange} 
      placeholder={LABELS.form.newCategoryPlaceholder} 
      className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kraft-400 transition outline-none italic" 
    />
  </div>
));

// --- ANA BİLEŞEN ---

export default function AddProductModal({
  isOpen,
  categories = [],
  onAdd,
  onClose,
}: AddProductModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Modal kapandığında formu temizle.
  useEffect(() => {
    if (!isOpen) { setForm(EMPTY_FORM); setPreviewUrl(null); setError(''); }
  }, [isOpen]);

  if (!isOpen) return null;

  // Giriş Alanlarını Yönet (Yazılanı State'e Aktar)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: value,
      // Eğer yeni kategori yazılıyorsa seçili butonu iptal et.
      category: name === 'newCategory' && value.trim() ? '' : prev.category 
    }));
    setError('');
  };

  // Fotoğrafı Sıkıştır ve Hazırla
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { compressImage } = await import('../utils/image');
      // TEKNİK: Sheets hücresine sığması için 400px genişliğe indiriyoruz.
      const compressedStr = await compressImage(file, TECH.image.modalUploadSize, TECH.image.uploadQuality);
      setPreviewUrl(compressedStr);
      setForm(prev => ({ ...prev, image: compressedStr }));
    } catch { setError(LABELS.saveError); }
  };

  // Formu Gönder (Sheets'e Gönderilecek Paket)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = form.newCategory.trim() || form.category.trim();
    
    // Güvenlik: Boş ürün kaydını önler.
    if (!form.name.trim() || !finalCategory || !form.price.trim()) {
      setError(LABELS.form.requiredFieldsError);
      return;
    }

    onAdd({
      name: form.name.trim(),
      category: finalCategory,
      price: form.price.trim(),
      description: form.description.trim(),
      image: form.image,
      inStock: form.inStock,
    });
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center ${MODAL.overlayBg} backdrop-blur-sm px-4 py-8`} role="dialog">
      <div className={`${MODAL.bgClass} w-full ${MODAL.maxWidthClass} ${MODAL.roundingClass} ${MODAL.shadowClass} flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200`}>
        
        {/* BAŞLIK */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="text-sm font-black text-stone-900 uppercase tracking-tight">{LABELS.newProductBtn}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-900 transition-colors text-2xl leading-none">×</button>
        </div>

        {/* FORM GÖVDESİ */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto custom-scrollbar">
          <ImagePicker previewUrl={previewUrl} onFileChange={handleImageChange} />

          <div className="space-y-4">
            {/* STOK DURUMU (AÇIK/KAPALI) */}
            <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 shadow-inner">
              <label className="text-xs font-bold text-stone-700 uppercase" htmlFor="add-instock">{LABELS.form.stockStatus}</label>
              <input id="add-instock" type="checkbox" checked={form.inStock} onChange={(e) => setForm(p => ({ ...p, inStock: e.target.checked }))} className="w-5 h-5 text-stone-900 border-stone-300 rounded-lg focus:ring-0 cursor-pointer" />
            </div>

            <FormInput label={LABELS.form.productName} name="name" value={form.name} onChange={handleChange} placeholder={LABELS.form.productNamePlaceholder} required />
            
            <CategorySelector categories={categories} selected={form.category} newCategory={form.newCategory} onSelect={(cat) => setForm(p => ({ ...p, category: cat, newCategory: '' }))} onNewCategoryChange={handleChange} />

            <FormInput label={LABELS.form.price} name="price" value={form.price} onChange={handleChange} placeholder={LABELS.form.pricePlaceholder} required />
            
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">{LABELS.form.description}</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kraft-400 transition outline-none" placeholder={LABELS.form.descriptionPlaceholder} />
            </div>
          </div>

          {error && (
            <div className={`bg-red-50 text-red-600 text-[10px] font-bold uppercase p-2 rounded-lg text-center border border-red-100`}>
              {error}
            </div>
          )}

          {/* AKSİYON BUTONLARI */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-50 transition uppercase">{LABELS.form.cancelBtn}</button>
            <button type="submit" className="flex-1 py-3 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition shadow-lg uppercase tracking-widest">{LABELS.form.submitBtn}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
