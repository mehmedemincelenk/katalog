import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

const MIDDLE_PHRASES = [
  "bir koli bandı ",
  "büyük boy çay  ",
  "sadece 5L süt  ",
  "bi bardak kahve"
];

export default function LandingPage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % MIDDLE_PHRASES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-stone-900 selection:text-white">
      {/* STICKY PROMO BAR */}
      <div className="sticky top-0 z-[100] bg-green-600 text-white py-3 px-4 text-center shadow-lg overflow-hidden">
        <p className="text-[10px] md:text-[12px] font-medium uppercase tracking-[0.1em] md:tracking-[0.2em] whitespace-nowrap opacity-90">
          domain <span className="font-black opacity-100">hediye!</span> <span className="mx-2 opacity-50">→</span> <span className="font-black bg-black/10 px-2 py-0.5 rounded normal-case opacity-100">www.markaniz.ekatalog.site</span>
        </p>
      </div>

      <section className="pt-12 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-5xl md:text-7xl font-black text-stone-900 tracking-tighter leading-[0.85] animate-in slide-in-from-bottom-8 duration-700">
            basit. sade.<br />ekatalog.
          </h1>
          
          <p className="max-w-2xl mx-auto text-base md:text-lg text-stone-500 font-medium leading-relaxed">
            Fiyatlar zamlandığında kataloglarınızı tek tek güncellemek gibi angarya maliyetlere veda edin, ekatalogunuzdan fiyatlarınızı saniyeler içinde güncelleyin.
          </p>

          <div className="pt-2 flex justify-center">
            <div className="max-w-[280px] md:max-w-[320px] rounded-lg overflow-hidden shadow-2xl border-4 border-green-600 bg-white ring-1 ring-stone-200">
              <img src="/images/catalog_preview.png" alt="E-Katalog Önizleme" className="w-full h-auto" />
            </div>
          </div>

          {/* PRICING & TRUST SECTION */}
          <div className="pt-10 flex flex-col items-center space-y-6">
            <div className="text-center flex flex-col items-center">
              <div className="w-fit flex flex-col items-center">
                <p className="text-6xl md:text-8xl font-black text-green-600 tracking-tighter leading-none">
                  ₺200<span className="text-lg font-bold opacity-70 ml-1"> / ay</span>
                </p>
                <div className="flex items-center justify-center text-stone-400 font-black text-[7px] md:text-[9px] uppercase tracking-[0.32em] md:tracking-[0.48em] -mt-1 md:-mt-2 whitespace-nowrap">
                  <span>aylık&nbsp;</span>
                  <div className="relative h-3 md:h-4 w-[75px] md:w-[105px] overflow-hidden inline-block">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={MIDDLE_PHRASES[index]}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        {MIDDLE_PHRASES[index].replace(/ /g, "\u00a0")}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <span>&nbsp;fiyatına</span>
                </div>
              </div>
              <p className="mt-4 text-[10px] font-bold text-stone-300 uppercase tracking-widest">Cayma bedeli yok, istediğiniz zaman iptal edin.</p>
            </div>

            {/* SETUP ASSISTANCE BADGE */}
            <div className="bg-stone-50 border border-stone-100 px-6 py-4 rounded-3xl flex items-center gap-4 animate-in fade-in zoom-in duration-700 delay-300">
               <span className="text-xl flex-shrink-0">✅</span>
               <p className="text-sm font-bold text-stone-900 leading-tight text-left">
                 Ürün/Hizmet listenizi bize atın, <span className="text-green-600 underline decoration-2 underline-offset-4">kataloğunuzu biz kuralım siz yönetin.</span>
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="pb-10 pt-2 md:pb-20 md:pt-4 px-4">
        <div className="max-w-4xl mx-auto bg-stone-900 rounded-[3.5rem] pt-8 pb-10 md:pt-20 md:pb-24 px-12 text-center space-y-12 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent"></div>
          <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none relative z-10">Hemen başlayalım.</h2>
            <a href="https://wa.me/905550000000" target="_blank" rel="noreferrer" className="inline-block">
              <Button variant="primary" size="lg" className="!bg-[#25D366] !text-white !rounded-lg p-4 md:p-8 shadow-2xl transition-all active:scale-95 hover:scale-105 group border-none aspect-square flex items-center justify-center">
                <svg className="w-40 h-40 md:w-80 md:h-80 fill-white drop-shadow-md" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.435 5.621 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </Button>
            </a>
        </div>
      </section>

      <footer className="pb-6 text-center border-t border-stone-100 pt-6 flex flex-col items-center gap-4">
        <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.5em]">
          ekatalog.site © 2026 — <span className="text-red-600">#</span>MİLLİTEKNOLOJİHAMLESİ
        </p>
      </footer>
    </div>
  );
}
