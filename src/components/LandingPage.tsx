import { THEME } from '../data/config';
import Button from './Button';

export default function LandingPage() {
  const icons = THEME.icons;

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-stone-900 selection:text-white">
      {/* HERO SECTION */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-full animate-in fade-in zoom-in duration-700">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">Yeni Nesil E-Katalog</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-stone-900 tracking-tighter leading-[0.9] animate-in slide-in-from-bottom-8 duration-700 delay-100">
            Dükkanınızı<br />Işık Hızında<br />Dijitalleştirin.
          </h1>
          
          <p className="max-w-xl mx-auto text-lg text-stone-500 font-medium leading-relaxed animate-in slide-in-from-bottom-8 duration-700 delay-200">
            Ürünlerinizi sergileyin, WhatsApp'tan sipariş alın. Karmaşık e-ticaret siteleriyle uğraşmayın, hızın tadını çıkarın.
          </p>

          <div className="pt-4 animate-in fade-in duration-1000 delay-300">
            <span className="text-2xl font-black text-stone-900 tracking-tight">200₺</span>
            <span className="text-stone-400 font-medium ml-1">/ ay</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 animate-in slide-in-from-bottom-8 duration-700 delay-300">
            <a href="https://wa.me/905550000000" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
              <Button 
                variant="primary" 
                size="md" 
                className="!rounded-full px-8 shadow-xl w-full whitespace-nowrap text-[11px]"
              >
                HEMEN KATALOG SAHİBİ OLUN
              </Button>
            </a>
            <a href="https://toptanambalajcim.ekatalog.site" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
              <Button 
                variant="secondary" 
                size="md" 
                className="!rounded-full px-8 w-full whitespace-nowrap text-[11px]"
              >
                ÖRNEK KATALOGU İNCELE
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* MARKETING & BRANDING SECTION */}
      <section className="py-24 px-4 border-t border-stone-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight leading-tight">
              Marka Prestijinizi<br />Yukarı Taşıyın.
            </h2>
            <p className="text-stone-500 font-medium leading-relaxed">
              Müşterilerinize karışık fiyat listeleri veya ağır PDF dosyaları göndermek yerine, onlara dükkanınıza özel <span className="text-stone-900 font-bold italic">markaniz.ekatalog.site</span> linkini gönderin. 
            </p>
            <ul className="space-y-3 text-stone-600 font-bold text-sm">
              <li className="flex items-center justify-center md:justify-start gap-3">
                <span className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-[10px]">✓</span>
                Kendi Subdomaininiz ile Kurumsal Kimlik
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3">
                <span className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-[10px]">✓</span>
                Tek Tıkla WhatsApp'tan Sipariş Alma
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3">
                <span className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-[10px]">✓</span>
                Sosyal Medya Profillerine Tam Uyum
              </li>
            </ul>
          </div>
          <div className="flex-1 bg-stone-50 rounded-[2.5rem] p-8 aspect-square flex items-center justify-center border border-stone-200/50 shadow-inner overflow-hidden relative group">
             <div className="absolute inset-0 bg-gradient-to-br from-stone-100/50 to-transparent"></div>
             <div className="relative text-stone-300 group-hover:scale-110 transition-transform duration-1000">
                {/* Minimalist visual representation of a catalog */}
                <div className="w-48 h-64 bg-white rounded-2xl shadow-2xl border border-stone-100 p-4 space-y-4">
                   <div className="w-full h-32 bg-stone-50 rounded-xl animate-pulse"></div>
                   <div className="w-3/4 h-3 bg-stone-100 rounded-full"></div>
                   <div className="w-1/2 h-3 bg-stone-50 rounded-full"></div>
                   <div className="w-full h-8 bg-stone-900 rounded-lg mt-4"></div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="bg-stone-50 py-32 px-4 border-t border-stone-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: "Mobil Öncelikli", desc: "Müşterileriniz telefonlarından tek tıkla ürünlerinize ulaşsın.", icon: "📱" },
            { title: "WhatsApp Entegre", desc: "Siparişler ve sorular doğrudan cebinize, WhatsApp üzerinden gelsin.", icon: "💬" },
            { title: "Işık Hızında", desc: "Açılış hızıyla rakiplerinizi geride bırakın, satışlarınızı hızlandırın.", icon: "⚡" }
          ].map((f, i) => (
            <div key={i} className="bg-white p-10 rounded-3xl shadow-sm border border-stone-200/50 space-y-4 hover:shadow-xl transition-all duration-500">
              <div className="text-4xl">{f.icon}</div>
              <h3 className="text-xl font-black text-stone-900 tracking-tight">{f.title}</h3>
              <p className="text-stone-500 font-medium leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 text-center border-t border-stone-100">
        <p className="text-xs font-black text-stone-300 uppercase tracking-[0.5em]">ekatalog.site © 2026</p>
      </footer>
    </div>
  );
}
