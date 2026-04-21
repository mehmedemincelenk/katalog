// FILE ROLE: Off-Hours Visitor Engagement (Night Shift Notification)
// DEPENDS ON: TECH config, framer-motion, lucide-react, generateWhatsAppLink
// CONSUMED BY: App.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TECH, THEME } from '../data/config';
import { X, MessageCircle } from 'lucide-react';
import { generateWhatsAppLink } from '../utils/contact';

interface OffHoursNoticeProps {
  whatsappNumber: string;
}

export default function OffHoursNotice({ whatsappNumber }: OffHoursNoticeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => 
    sessionStorage.getItem('ekatalog_offhours_dismissed') === 'true'
  );

  useEffect(() => {
    if (isDismissed) return;

    // Check time based on TECH constants
    const currentHour = new Date().getHours();
    const isOffHours = currentHour >= (TECH.offHours?.start || 23) || currentHour < (TECH.offHours?.end || 7);

    if (isOffHours) {
      // 5 second delay as requested in Task Prompt 2
      const timer = setTimeout(() => setIsVisible(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('ekatalog_offhours_dismissed', 'true');
  };

  const handleWhatsAppClick = () => {
    const message = "Merhaba, şu an çalışma saatleri dışındayız sanırım. Ürünlerinizle ilgileniyorum, sabah dönüş yapar mısınız?";
    window.open(generateWhatsAppLink(whatsappNumber, message), '_blank');
    handleDismiss();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-[100] w-[calc(100%-48px)] sm:w-[360px]"
        >
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl border border-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl p-6">
            {/* Decoration */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-stone-900/5 rounded-full blur-2xl" />
            
            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                  🌙
                </div>
                <div>
                  <h4 className="text-sm font-black text-stone-900 tracking-tight">Gece Vardiyası</h4>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">Dinleniyoruz...</p>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-stone-900 font-bold text-sm leading-tight">
                  Şu an çalışma saatleri dışındayız.
                </h5>
                <p className="text-stone-500 text-xs font-medium leading-relaxed">
                  İlgilendiğiniz ürünleri buraya not bırakın, sabah ilk iş size dönelim.
                </p>
              </div>

              <button
                onClick={handleWhatsAppClick}
                className="w-full h-12 bg-stone-900 hover:bg-black text-white rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-stone-900/10 group"
              >
                <div className="w-5 h-5 group-hover:rotate-12 transition-transform">
                  <MessageCircle size={20} fill="currentColor" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest">WhatsApp ile Gönder</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
