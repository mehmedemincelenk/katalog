import { useState } from 'react';
import { motion } from 'framer-motion';
import * as Lucide from 'lucide-react';
import Numpad from './Numpad';
import { useSettings } from '../hooks/useSettingsHub';
import { MaintenancePageProps } from '../types';

/**
 * MAINTENANCE PAGE (Diamond Standard v2.0)
 * -----------------------------------------------------------
 * A professional downtime interface with lead capture and hidden admin access.
 */
export default function MaintenancePage({ onLogoPointerDown, onLogoPointerUp }: MaintenancePageProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const { settings, addVisitorLead } = useSettings(false);
  const [isLogoPressed, setIsLogoPressed] = useState(false);

  const handlePressStart = () => {
    setIsLogoPressed(true);
    onLogoPointerDown();
  };

  const handlePressEnd = () => {
    setIsLogoPressed(false);
    onLogoPointerUp();
  };

  const handleLeadSubmit = async (phone: string) => {
    try {
      await addVisitorLead(phone);
      setIsSuccess(true);
    } catch (err) {
      console.error('Maintenance lead failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-stone-900/10" />
      
      <div className="max-w-md w-full space-y-12 relative z-10">
        {/* BRANDING (HIDDEN ADMIN ACCESS) */}
        <div 
          className={`flex flex-col items-center space-y-4 transition-all duration-300 cursor-pointer touch-none ${isLogoPressed ? 'scale-90 opacity-60' : 'scale-100'}`}
          onPointerDown={handlePressStart}
          onPointerUp={handlePressEnd}
          onPointerLeave={handlePressEnd}
          onContextMenu={(e) => e.preventDefault()}
          style={{ userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none' }}
        >
          {settings?.logoUrl ? (
            <img 
              src={settings.logoUrl} 
              alt={settings.title} 
              className="h-20 w-auto object-contain mb-2 pointer-events-none drop-shadow-xl" 
            />
          ) : (
            <div className="w-20 h-20 bg-stone-900 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-2xl">
              {settings?.title?.charAt(0) || 'E'}
            </div>
          )}
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-stone-900 tracking-tighter uppercase">{settings?.title}</h1>
            <div className="h-0.5 w-12 bg-stone-900/10 mx-auto rounded-full" />
          </div>
        </div>

        <div className="relative">
          {/* SUCCESS STATE */}
          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-stone-50 rounded-[2.5rem] p-12 border border-stone-100 flex flex-col items-center space-y-6 shadow-sm"
            >
              <div className="w-20 h-20 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Lucide.Check size={40} strokeWidth={3} />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black text-stone-900 uppercase tracking-tight">KAYDEDİLDİ!</h4>
                <p className="text-stone-400 text-sm font-bold leading-relaxed px-4">
                  Dükkanı açtığımızda sizi ilk biz arayacağız. İlginiz için teşekkürler!
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-10">
              <div className="space-y-4">
                <h2 className="text-6xl font-black text-stone-900 tracking-tighter leading-none uppercase">
                  BAKIMDA
                </h2>
                <p className="text-stone-400 text-xs font-black uppercase tracking-[0.3em] opacity-60">
                  Şu an güncelleme yapıyoruz
                </p>
              </div>

              {/* LEAD CAPTURE SECTION */}
              <div className="bg-white border-2 border-stone-100 rounded-[2.5rem] p-8 shadow-2xl shadow-stone-200/40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                
                <div className="text-center mb-8 relative z-10">
                  <p className="text-xl font-black text-stone-900 tracking-tighter uppercase">Sizi Arayalım</p>
                  <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">Numaranızı bırakın, açılışta haber verelim</p>
                </div>
                
                <div className="relative z-10">
                  <Numpad onSubmit={handleLeadSubmit} maxDigits={10} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="pt-8 opacity-30">
          <p className="text-[9px] font-black text-stone-500 uppercase tracking-[0.6em]">
            EKATALOG.SITE — #DIAMONDSTANDARD
          </p>
        </div>
      </div>
    </div>
  );
}
