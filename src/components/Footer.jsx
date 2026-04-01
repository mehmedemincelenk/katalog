import { COMPANY } from '../data/config';

export default function Footer({ onLogoClick, isAdmin }) {
  return (
    <footer className="bg-white border-t border-stone-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center gap-3">
        {/* Logo — 7 rapid clicks = activate admin, 1 click = exit admin */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 select-none focus:outline-none"
          aria-label="Marka logosu"
          title={isAdmin ? 'Admin modu aktif — çıkmak için tıkla' : ''}
        >
          <span className="text-2xl">{COMPANY.logoEmoji}</span>
          <span className="font-bold text-stone-900 tracking-tight">{COMPANY.name}</span>
          {isAdmin && (
            <span className="ml-1 text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded">
              ADMİN
            </span>
          )}
        </button>

        <p className="text-xs text-stone-400 text-center">
          © {new Date().getFullYear()} {COMPANY.name}. Tüm hakları saklıdır.
        </p>
        <p className="text-xs text-stone-400">{COMPANY.address}</p>
      </div>
    </footer>
  );
}
