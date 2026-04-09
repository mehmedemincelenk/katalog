import FloatingButton from './FloatingButton';

/**
 * 🎓 MENTOR NOTU: FloatingAdminMenu (Sade & Hızlı Erişim)
 * --------------------------------------------------
 * Menü mantığı kaldırıldı. Butonlar doğrudan erişilebilir durumda.
 */
interface FloatingAdminMenuProps {
  onLogout: () => void;
  onAddClick: () => void;
}

const ICONS = {
  power: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" /></svg>,
  add: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
};

export default function FloatingAdminMenu({ onLogout, onAddClick }: FloatingAdminMenuProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 items-center">
      {/* ÜRÜN EKLE BUTONU */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 active:scale-95 hover:bg-white/60">
        <FloatingButton 
          onClick={onAddClick} 
          icon={ICONS.add}
          variant="secondary"
          className="!w-10 !h-10 border-none shadow-none bg-transparent !text-stone-900"
        />
      </div>

      {/* ÇIKIŞ BUTONU */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 active:scale-95 hover:bg-white/60">
        <FloatingButton 
          onClick={onLogout} 
          icon={<span className="text-red-500">{ICONS.power}</span>}
          variant="secondary"
          className="!w-10 !h-10 border-none shadow-none bg-transparent !text-lg"
        />
      </div>
    </div>
  );
}
