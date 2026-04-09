import React from 'react';

/**
 * 🎓 MENTOR NOTU: FloatingButton (Yüzen Buton)
 * ------------------------------------------
 * Bu bileşen, projenin her yerinde (Admin menüsü, Ekle butonu vb.) kullanılan 
 * temel "Atomik" bir bileşendir. Kodun tekrar kullanılabilir (reusable) 
 * olması için "Props" (özellikler) yapısını kullanır.
 */
interface FloatingButtonProps {
  onClick: (e: React.MouseEvent) => void; // Tıklama olayı (Fonksiyon)
  icon: React.ReactNode;                  // İçeride görünecek ikon (SVG, Yazı, Emoji)
  label?: string;                         // Butonun yanındaki açıklama metni
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'kraft' | 'glass'; // Görsel stil türü
  className?: string;                     // Dışarıdan ekstra CSS eklemek için
}

export default function FloatingButton({ 
  onClick, icon, label, variant = 'secondary', className = '' 
}: FloatingButtonProps) {
  
  const variants = {
    primary: 'bg-stone-900 text-white border-stone-800 shadow-2xl hover:bg-stone-800',
    secondary: 'bg-white text-stone-900 border-stone-200 shadow-2xl hover:bg-stone-50',
    danger: 'bg-red-50 text-red-600 border-red-200 shadow-xl hover:bg-red-600 hover:text-white',
    success: 'bg-green-50 text-green-700 border-green-200 shadow-xl hover:bg-green-600 hover:text-white',
    kraft: 'bg-kraft-600 text-white border-kraft-700 shadow-2xl hover:bg-kraft-700',
    glass: 'bg-white/10 backdrop-blur-xl text-stone-900 border-white/20 hover:bg-white/20 shadow-none',
  };

  return (
    <button 
      onClick={onClick}
      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all active:scale-95 group relative ${variants[variant]} ${className}`}
    >
      {/* İkonun butonun tam ortasında durmasını sağlar */}
      <span className="text-xl leading-none flex items-center justify-center">{icon}</span>
    </button>
  );
}
