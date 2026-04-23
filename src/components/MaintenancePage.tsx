import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import Button from './Button';
import { resolveVisualAssetUrl } from '../utils/image';
import { MaintenancePageProps } from '../types';

export default function MaintenancePage({
  settings,
  onLogoPointerDown,
  onLogoPointerUp,
}: MaintenancePageProps) {
  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${settings.whatsapp}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      {/* Animated Background Element */}
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
          scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute w-[500px] h-[500px] bg-stone-50 rounded-full blur-3xl -z-10"
      />

      <div className="max-w-md w-full flex flex-col items-center">
        {/* LOGO */}
        {settings.logoUrl && (
          <div className="relative mb-12">
            <motion.img
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              src={resolveVisualAssetUrl(settings.logoUrl) || ''}
              alt={settings.name}
              className="h-16 sm:h-20 object-contain"
            />
            {/* INVISIBLE SHIELD: This layer catches the gestures */}
            <div
              className="absolute inset-0 z-20 cursor-pointer"
              onPointerDown={onLogoPointerDown}
              onPointerUp={onLogoPointerUp}
              onContextMenu={(e) => e.preventDefault()}
              style={{ touchAction: 'none' }}
            />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-stone-900 text-white p-2 px-4 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-6"
        >
          Sistem Bakımda
        </motion.div>

        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight mb-4 tracking-tighter uppercase">
          Size Daha İyi Bir <br /> Deneyim Hazırlıyoruz
        </h1>

        <p className="text-stone-400 text-sm sm:text-base font-medium max-w-sm mb-10 leading-relaxed">
          Katalog güncellemeleri ve sistem iyileştirmeleri nedeniyle kısa bir
          ara verdik. Çok yakında buradayız.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            onClick={handleWhatsAppClick}
            variant="primary"
            mode="rectangle"
            className="flex-1 !py-4 font-black tracking-widest uppercase text-xs"
            icon={<Settings className="w-4 h-4 animate-spin-slow" />}
          >
            BİZE ULAŞIN
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-100 w-full">
          <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">
            {settings.name} &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
