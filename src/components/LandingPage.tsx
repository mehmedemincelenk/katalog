import { THEME } from '../data/config';
import Button from './Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-stone-900 selection:text-white">
      {/* HERO SECTION */}
      <section className="pt-16 pb-20 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-10">
          <h1 className="text-5xl md:text-8xl font-black text-stone-900 tracking-tighter leading-[0.85] animate-in slide-in-from-bottom-8 duration-700">
            E-Kataloğunuz<br />Bugün Hazır.
          </h1>
          
          <p className="max-w-lg mx-auto text-xl text-stone-500 font-medium leading-relaxed">
            Ürünlerinizi sergileyin, WhatsApp'tan sipariş alın.<br />Karmaşık sistemlere veda edin.
          </p>

          <div className="flex flex-col items-center gap-6 pt-4">
            <div className="inline-flex flex-col items-center">
              <div className="bg-green-500 text-white px-8 py-3 rounded-2xl shadow-xl shadow-green-500/10 border border-green-400">
                <span className="text-3xl font-black tracking-tighter">200₺</span>
                <span className="text-green-100 font-bold ml-2 text-sm">/ ay</span>
              </div>
              <p className="mt-4 text-stone-900 font-black text-[10px] uppercase tracking-[0.2em]">Dükkanınıza Özel Web Adresi Dahil</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a href="https://wa.me/905550000000" target="_blank" rel="noreferrer">
                <Button variant="primary" size="md" className="!rounded-full px-12 shadow-2xl font-black text-[11px]">
                  E-KATALOG SAHİBİ OLUN
                </Button>
              </a>
              <a href="https://toptanambalajcim.ekatalog.site" target="_blank" rel="noreferrer">
                <Button variant="secondary" size="md" className="!rounded-full px-12 font-black text-[11px]">
                  ÖRNEĞİ İNCELE
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* THE VALUE SECTION */}
      <section className="py-24 px-4 bg-stone-50/50 border-t border-stone-100">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
          <div className="space-y-6">
            <h2 className="text-4xl font-black text-stone-900 tracking-tighter leading-none">Net ve Hızlı.</h2>
            <p className="text-stone-500 font-medium text-lg">Müşterilerinize PDF göndermeyin. Onlara dükkanınıza özel, profesyonel bir link verin.</p>
            <ul className="space-y-4 text-stone-900 font-black text-xs uppercase tracking-widest">
              <li className="flex items-center gap-3">✓ 24 Saat Açık Vitrin</li>
              <li className="flex items-center gap-3">✓ WhatsApp Sipariş Hattı</li>
              <li className="flex items-center gap-3">✓ Kartvizitlere Tam Uyum</li>
            </ul>
          </div>
          <div className="bg-stone-900 rounded-[3rem] p-10 aspect-square flex flex-col justify-center shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
             <h3 className="text-white text-3xl font-black tracking-tighter leading-none relative z-10">Katalog<br />Status: <span className="text-green-400">Live</span></h3>
             <div className="mt-8 w-24 h-1 bg-white/20 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-stone-900 rounded-[3rem] p-12 md:p-20 text-center space-y-10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent"></div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none relative z-10">Hemen Başlatın.</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <a href="https://wa.me/905550000000" target="_blank" rel="noreferrer">
              <Button variant="primary" size="lg" className="!bg-white !text-stone-900 !rounded-full px-12 font-black">
                WHATSAPP'TAN YAZIN 🚀
              </Button>
            </a>
          </div>
        </div>
      </section>

      <footer className="pb-12 text-center">
        <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.5em]">ekatalog.site © 2026</p>
      </footer>
    </div>
  );
}
