import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

const PRICING_PHRASES = [
  'aylık bir porsiyon karışık kebap fiyatına',
  'aylık bir oto yıkama fiyatına',
  'aylık bir koli bandı seti fiyatına',
  'aylık bir paket A4 kağıdı fiyatına',
  'aylık bir berber tıraşı fiyatına',
  'aylık bir tepsi baklava fiyatına',
  'aylık bir otopark aboneliği fiyatına',
  'aylık bir damacana su seti fiyatına',
  'aylık sinema bileti ve mısır fiyatına',
  'aylık bir asma kilit fiyatına',
  'aylık bir tornavida seti fiyatına',
  'aylık bir WD-40 ve bez fiyatına',
  'aylık bir silecek takımı fiyatına',
  'aylık bir koli yumurta fiyatına',
  'aylık bir tüp gazın yarısı fiyatına',
  'aylık bir kedi maması paketi fiyatına',
  'aylık bir çırak yevmiyesi fiyatına',
  'aylık bir paket kaliteli çay fiyatına',
  'aylık bir vantilatör kayışı fiyatına',
  'aylık bir çift pazar terliği fiyatına',
  'aylık bir sinyal kolu tamiri fiyatına',
  'aylık bir dükkan önü dubası fiyatına',
  'aylık bir çay ocağı aylık hesabı fiyatına',
];

const DOMAIN_EXTENSIONS = ['site', 'shop', 'co', 'cafe', 'me'];

export default function LandingPage() {
  const [index, setIndex] = useState(0);

  const [domainIndex, setDomainIndex] = useState(0);
  const [shadowOffset, setShadowOffset] = useState({ x: 0, y: 15 });

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % PRICING_PHRASES.length);
    }, 2300);

    const domainInterval = setInterval(() => {
      setDomainIndex((prev) => (prev + 1) % DOMAIN_EXTENSIONS.length);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(domainInterval);
    };
  }, []);

  // Responsive Shadow Engine (Gyroscope + Mouse Hook)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30 + 15;
      setShadowOffset({ x: -x, y: -y }); // Invert for natural lighting
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        // gamma: left/right tilt, beta: front/back tilt
        const x = Math.max(-20, Math.min(20, e.gamma / 1.5));
        const y = Math.max(-20, Math.min(20, (e.beta - 45) / 1.5)) + 15;
        setShadowOffset({ x: -x, y: -y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('deviceorientation', handleDeviceOrientation);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-stone-900 selection:text-white">
      {/* STICKY PROMO BAR */}
      <div className="sticky top-0 z-[100] bg-green-600 text-white py-3 px-4 text-center shadow-lg overflow-hidden">
        <p className="text-[10px] md:text-[12px] font-medium uppercase tracking-[0.1em] md:tracking-[0.2em] whitespace-nowrap opacity-90 flex items-center justify-center">
          domain <span className="font-black opacity-100 ml-1">hediye!</span>{' '}
          <span className="mx-2 opacity-50">→</span>
          <span className="font-black bg-black/10 px-2 py-0.5 rounded normal-case opacity-100 inline-flex items-center">
            www.sirketiniz.ekatalog.
            <span className="relative inline-flex h-[1em] overflow-visible">
              <AnimatePresence mode="wait">
                <motion.span
                  key={DOMAIN_EXTENSIONS[domainIndex]}
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -5, opacity: 0 }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                  className="text-white leading-none inline-block whitespace-nowrap translate-y-[0.05em]"
                >
                  {DOMAIN_EXTENSIONS[domainIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
        </p>
      </div>

      <section className="pt-12 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-5xl md:text-7xl font-black text-stone-900 tracking-tighter leading-[0.85] animate-in slide-in-from-bottom-8 duration-700">
            sade. basit.
            <br />
            ekatalog.
          </h1>

          <p className="max-w-2xl mx-auto text-base md:text-lg text-stone-500 font-medium leading-relaxed">
            Fiyatlar zamlandığında kataloglarınızı saniyeler içinde güncelleyin.
            Angaryaya değil, işinize odaklanın.
          </p>

          <div className="pt-4 flex justify-center relative">
            <div className="max-w-[280px] md:max-w-[320px] rounded-2xl overflow-hidden shadow-2xl border-4 border-green-600 bg-white ring-8 ring-green-600/5 relative">
              <img
                src="/images/catalog_preview.png"
                alt="E-Katalog Önizleme"
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* THE ROADMAP - Transparent Backdrop Panel */}
          <div className="pt-10 md:pt-16 max-w-3xl mx-auto">
            <div className="grid grid-cols-3 gap-2 md:gap-4 bg-white/60 backdrop-blur-md p-4 md:p-8 rounded-xl border border-stone-100 shadow-xl shadow-stone-200/50">
              <div className="space-y-1 md:space-y-4 p-2">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-stone-900 rounded-xl md:rounded-2xl flex items-center justify-center text-white mx-auto text-sm md:text-xl font-black">
                  1
                </div>
                <h3 className="text-[10px] md:text-xl font-black tracking-tight text-stone-900 leading-tight">
                  Listenizi Atın
                </h3>
                <p className="text-stone-500 text-[10px] md:text-sm leading-tight font-medium hidden md:block">
                  WhatsApp'tan gönderin.
                </p>
              </div>
              <div className="space-y-1 md:space-y-4 p-2">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-stone-900 rounded-xl md:rounded-2xl flex items-center justify-center text-white mx-auto text-sm md:text-xl font-black">
                  2
                </div>
                <h3 className="text-[10px] md:text-xl font-black tracking-tight text-stone-900 leading-tight">
                  Biz Kuralım
                </h3>
                <p className="text-stone-500 text-[10px] md:text-sm leading-tight font-medium hidden md:block">
                  Aynı gün teslim.
                </p>
              </div>
              <div className="space-y-1 md:space-y-4 p-2">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-green-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white mx-auto text-sm md:text-xl font-black shadow-lg shadow-green-500/20">
                  <svg
                    className="w-4 h-4 md:w-6 md:h-6 stroke-current stroke-[4px]"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-[10px] md:text-xl font-black tracking-tight text-stone-900 leading-tight">
                  Siz Yönetin
                </h3>
                <p className="text-stone-500 text-[10px] md:text-sm leading-tight font-medium hidden md:block italic">
                  Fiyatları anında güncelleyin.
                </p>
              </div>
            </div>
          </div>

          {/* PRICING & TRUST SECTION */}
          <div className="text-center flex flex-col items-center pt-36">
            <div className="w-fit flex flex-col items-center relative">
              {/* CAMPAIGN CHIPS - Completely Static */}
              <div className="absolute -top-8 -left-1 bg-green-500 text-white text-[9px] font-black px-3 py-1 rounded-lg -rotate-2 shadow-xl whitespace-nowrap z-40">
                İLK AY BEDAVA 🎁
              </div>

              <div className="absolute -top-14 -left-14 bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-lg -rotate-12 shadow-xl whitespace-nowrap z-30">
                TEMMUZ'A KADAR %20 İNDİRİM 🏷️
              </div>

              <p className="text-[10px] md:text-sm font-black text-stone-300 uppercase tracking-[0.3em] line-through mb-1">
                ₺500 / AY
              </p>
              <p className="text-7xl md:text-9xl font-black text-stone-900 tracking-tighter leading-none pr-1">
                ₺399
                <span className="text-xl font-bold opacity-30 ml-2">
                  &nbsp;/&nbsp;ay&nbsp;
                </span>
              </p>
              <div className="relative h-4 md:h-6 w-full mt-2 overflow-visible">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={PRICING_PHRASES[index]}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: 'easeInOut',
                    }}
                    className="text-green-600 font-black text-[8px] md:text-[11px] uppercase tracking-[0.4em] md:tracking-[0.6em] text-center whitespace-nowrap absolute inset-0 flex items-center justify-center"
                  >
                    {PRICING_PHRASES[index]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="pb-20 px-4 -mt-6 md:-mt-12">
        <div className="max-w-2xl mx-auto bg-stone-900 rounded-[2.5rem] pt-8 pb-10 md:pt-12 md:pb-14 px-6 md:px-10 text-center space-y-8 shadow-3xl relative overflow-hidden w-full">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent"></div>
          <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none relative z-10 w-full text-center">
            Şimdi Ürünlerinizi Gönderin
          </h2>
          <div className="relative z-20 flex justify-center w-full">
            <a
              href="https://wa.me/905373420161"
              target="_blank"
              rel="noreferrer"
            >
              <motion.div
                animate={{
                  boxShadow: `${shadowOffset.x}px ${shadowOffset.y}px 40px rgba(37, 211, 102, 0.4)`,
                }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.8 }}
                className="rounded-full"
              >
                <Button
                  variant="primary"
                  mode="rectangle"
                  size="lg"
                  className="!bg-[#25D366] !text-white flex items-center justify-center transition-all active:scale-95 group border-none !p-8 md:!p-10 !rounded-full"
                >
                  <svg
                    className="w-12 h-12 md:w-14 md:h-14 fill-white drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.435 5.621 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </Button>
              </motion.div>
            </a>
          </div>
          <p className="text-white/40 text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] relative z-10 w-full text-center">
            Taahhüt yok, cayma bedeli yok.
          </p>
        </div>

        {/* SECONDARY CONTACT (Direct Line for Trust) */}
        <div className="mt-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-700">
          <a
            href="tel:905373420161"
            className="bg-stone-900 rounded-3xl px-8 py-4 flex items-center gap-4 group hover:bg-stone-800 hover:shadow-2xl transition-all cursor-pointer"
          >
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
              <svg
                className="w-5 h-5 fill-none stroke-current stroke-2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-xl font-black text-white tracking-tighter transition-colors group-hover:text-stone-300">
              +90 537 342 01 61
            </p>
          </a>
        </div>
      </section>

      <footer className="text-center border-t border-stone-100 pt-10 flex flex-col items-center gap-4 px-4 pb-4">
        <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.5em]">
          ekatalog.site © 2026 — <span className="text-red-600">#</span>
          MİLLİTEKNOLOJİHAMLESİ
        </p>
      </footer>
    </div>
  );
}
