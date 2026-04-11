import React, { useState, useEffect } from 'react';

interface PinModalProps {
  isOpen: boolean;
  correctPin: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function PinModal({ isOpen, correctPin, onSuccess, onClose }: PinModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  // PIN 4 haneye ulaştığında otomatik kontrol et
  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPin) {
        onSuccess();
        setPin('');
      } else {
        setError(true);
        // iPhone hata titreşimi efekti süresi
        setTimeout(() => {
          setError(false);
          setPin('');
        }, 500);
      }
    }
  }, [pin, correctPin, onSuccess]);

  if (!isOpen) return null;

  const handleNumber = (n: string) => {
    if (pin.length < 4 && !error) setPin(prev => prev + n);
  };

  const handleBackspace = () => {
    if (!error) setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl animate-in fade-in duration-500">
      {/* Kapatma Alanı (Overlay) */}
      <div className="absolute inset-0" onClick={onClose} />

      <div 
        className={`relative w-full max-w-[320px] sm:max-w-[360px] flex flex-col items-center select-none transform transition-transform duration-300 ${error ? 'animate-shake' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Başlık Grubu */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl border border-white/20">
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Giriş Yapın</h2>
          <p className="text-white/60 text-sm mt-1 font-medium">Mağaza yönetim şifrenizi girin</p>
        </div>

        {/* PIN Noktaları (Apple Style) */}
        <div className="flex justify-center gap-6 mb-12">
          {[0, 1, 2, 3].map(i => (
            <div 
              key={i}
              className={`w-3.5 h-3.5 rounded-full border border-white/40 transition-all duration-300 ${
                pin.length > i 
                  ? 'bg-white scale-125 shadow-[0_0_15px_rgba(255,255,255,0.5)] border-white' 
                  : 'bg-transparent'
              } ${error ? 'bg-red-500 border-red-500' : ''}`}
            />
          ))}
        </div>

        {/* Sayı Klavyesi (Responsive Grid) */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-5 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button
              key={n}
              onClick={() => handleNumber(String(n))}
              className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/10 backdrop-blur-md transition-all flex items-center justify-center mx-auto overflow-hidden active:scale-90"
            >
              <span className="text-2xl sm:text-3xl font-light text-white leading-none">{n}</span>
            </button>
          ))}
          
          {/* Vazgeç / Sol Boşluk */}
          <button 
            onClick={onClose}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto text-white/40 hover:text-white/80 transition-colors text-xs font-bold uppercase tracking-widest active:scale-95"
          >
            Vazgeç
          </button>

          {/* SIFIR */}
          <button
            onClick={() => handleNumber('0')}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/10 backdrop-blur-md transition-all flex items-center justify-center mx-auto active:scale-90"
          >
            <span className="text-2xl sm:text-3xl font-light text-white leading-none">0</span>
          </button>

          {/* SİLME */}
          <button
            onClick={handleBackspace}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto text-white/60 hover:text-white active:scale-90 transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
              <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z" />
            </svg>
          </button>
        </div>

      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}
