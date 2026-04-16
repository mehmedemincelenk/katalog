import { THEME } from '../data/config';
import Button from './Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-stone-900 selection:text-white">
      {/* STICKY PROMO BAR */}
      <div className="sticky top-0 z-[100] bg-red-600 text-white py-3 px-4 text-center shadow-lg overflow-hidden">
        <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] whitespace-nowrap">
          <span className="bg-black/10 px-2 py-0.5 rounded mx-1 normal-case">www.markaniz.ekatalog.site</span> website adresi hediye!
        </p>
      </div>

      <section className="pt-12 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-5xl md:text-7xl font-black text-stone-900 tracking-tighter leading-[0.85] animate-in slide-in-from-bottom-8 duration-700">
            basit. sade.<br />ekatalog.
          </h1>
          
          <p className="max-w-xl mx-auto text-base md:text-lg text-stone-500 font-medium leading-relaxed">
            Katalog maliyetinden kurtulun. Ürünlerinizi saniyeler içinde güncelleyin.
          </p>

          <div className="pt-2 flex justify-center">
            <div className="max-w-[280px] md:max-w-[320px] rounded-lg overflow-hidden shadow-2xl border-4 border-green-600 bg-white ring-1 ring-stone-200">
              <img src="/images/catalog_preview.png" alt="E-Katalog Önizleme" className="w-full h-auto" />
            </div>
          </div>

          {/* PRICING & TRUST SECTION */}
          <div className="pt-10 flex flex-col items-center">
            <div className="bg-stone-50 p-10 rounded-[3rem] border border-stone-100 shadow-sm relative overflow-hidden group hover:border-green-100 hover:bg-green-50/20 transition-all duration-500">
               {/* TRUST BADGE */}
               <div className="absolute top-0 right-0 bg-green-600 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-[0.2em] shadow-lg">
                 5 Dakikada Yayında
               </div>

               <div className="space-y-1">
                 <p className="text-stone-400 font-bold text-[11px] uppercase tracking-[0.3em] mb-2">Başlangıç Paketi</p>
                 <p className="text-6xl md:text-7xl font-black text-green-600 tracking-tighter leading-none">
                   200₺<span className="text-base font-bold opacity-40 ml-1">/ay</span>
                 </p>
                 <p className="text-stone-400 font-black text-[10px] uppercase tracking-[0.25em] pt-2">aylık bir koli bandı fiyatına</p>
               </div>
               
               <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-stone-900 font-bold text-[11px] uppercase tracking-widest border-t border-stone-200/50 pt-6">
                 <span className="flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-green-500"></span> Sınırsız Ürün
                 </span>
                 <span className="flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-green-500"></span> WhatsApp Sipariş
                 </span>
                 <span className="flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-green-500"></span> QR Kod Hediye
                 </span>
               </div>
            </div>
            
            <p className="mt-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Kredi kartı gerekmez. İstediğiniz zaman durdurun.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10">
            <a href="https://wa.me/905550000000" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="!rounded-full px-24 shadow-2xl shadow-green-500/20 font-black text-[14px] w-full sm:w-auto hover:scale-105 transition-transform">
                KATALOĞUMU OLUŞTUR 🚀
              </Button>
            </a>
            <a href="https://toptanambalajcim.ekatalog.site" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="!rounded-full px-24 font-black text-[14px] w-full sm:w-auto border-stone-200 hover:bg-stone-50">
                ÖRNEĞİ İNCELE
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* FEATURES GRID SECTION */}
      <section className="py-24 px-4 bg-white border-t border-stone-100">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-stone-900 tracking-tight uppercase">Eksiksiz & Profesyonel</h2>
            <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">İhtiyacınız olan her şey tek bir panelde.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Basit Yönetim", desc: "Telefonunuzdan saniyeler içinde ürün ekleyin, silin veya güncelleyin.", icon: "📱" },
              { title: "Toplu Güncelleme", desc: "Tüm dükkana veya seçtiğiniz reyona tek tıkla zam veya indirim uygulayın.", icon: "📈" },
              { title: "WhatsApp Sipariş", desc: "Müşterileriniz ürün seçtiğinde sipariş listesi doğrudan cebinize gelsin.", icon: "💬" },
              { title: "Sınırsız Reyon", desc: "Ürünlerinizi istediğiniz gibi gruplayın, parmağınızla sürükleyerek sıralayın.", icon: "🗂️" },
              { title: "Işık Hızında", desc: "Müşterileriniz beklemeyi sevmez. Kataloğunuz her telefonda anında açılır.", icon: "⚡" },
              { title: "Sade Tasarım", desc: "Karmaşık menüler yok. Sadece ürünleriniz ve markanız ön planda.", icon: "💎" },
              { title: "QR Kod Menü", desc: "Dükkanınıza asacağınız tek bir QR kod ile tüm kataloğunuz müşterinin cebinde.", icon: "🔍" },
              { title: "Arama & Filtre", desc: "Müşterileriniz binlerce ürün arasından aradığını saniyeler içinde bulur.", icon: "🔎" },
              { title: "Stok Kontrolü", desc: "Biten ürünleri tek tıkla gizleyin, müşterilerinize her zaman güncel stok sunun.", icon: "📦" }
            ].map((f, i) => (
              <div key={i} className="bg-stone-50 p-8 rounded-[2rem] border border-stone-100 hover:bg-stone-900 hover:text-white transition-all duration-500 group">
                <div className="text-3xl mb-6 group-hover:scale-110 transition-transform duration-500">{f.icon}</div>
                <h3 className="text-xl font-black tracking-tight mb-3">{f.title}</h3>
                <p className="text-stone-500 group-hover:text-stone-400 font-medium text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-stone-900 rounded-[3.5rem] p-12 md:p-24 text-center space-y-12 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent"></div>
          <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none relative z-10">Siz de hemen başlayın.</h2>
          <div className="flex flex-col items-center justify-center relative z-10">
            <a href="https://wa.me/905550000000" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="!bg-white !text-stone-900 !rounded-full px-24 font-black shadow-xl w-full sm:w-auto">
                WHATSAPP'TAN YAZIN 🚀
              </Button>
            </a>
          </div>
        </div>
      </section>

      <footer className="pb-12 text-center border-t border-stone-100 pt-12">
        <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.5em]">ekatalog.site © 2026 — HER DÜKKANA BİR WEB ADRESİ</p>
      </footer>
    </div>
  );
}
