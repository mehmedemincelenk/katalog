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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in slide-in-from-bottom-8 duration-700 delay-300">
            <a href="https://wa.me/905550000000" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
              <Button 
                variant="primary" 
                size="lg" 
                className="!rounded-full px-8 sm:px-12 shadow-2xl w-full whitespace-nowrap"
              >
                HEMEN KATALOG SAHİBİ OLUN
              </Button>
            </a>
            <a href="https://toptanambalajcim.ekatalog.site" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
              <Button 
                variant="secondary" 
                size="lg" 
                className="!rounded-full px-8 sm:px-12 w-full whitespace-nowrap"
              >
                ÖRNEK KATALOGU İNCELE
              </Button>
            </a>
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
