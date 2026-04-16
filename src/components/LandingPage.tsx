import { THEME } from '../data/config';
import Button from './Button';

export default function LandingPage() {
  const icons = THEME.icons;

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-stone-900 selection:text-white">
      {/* HERO SECTION */}
      <section className="pt-20 pb-24 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-full animate-in fade-in zoom-in duration-700">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">Dükkanınız İçin En Akıllı Yatırım</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-stone-900 tracking-tighter leading-[0.9] animate-in slide-in-from-bottom-8 duration-700 delay-100">
            Dükkanınızı<br />Dünyaya<br />Açın.
          </h1>
          
          <p className="max-w-xl mx-auto text-lg text-stone-500 font-medium leading-relaxed animate-in slide-in-from-bottom-8 duration-700 delay-200">
            Ürünlerinizi profesyonel bir şekilde sergileyin, siparişleri doğrudan WhatsApp'tan alın. Web sitesi kurma derdine, karmaşık sistemlere son!
          </p>

          <div className="pt-4 animate-in fade-in duration-1000 delay-300">
            <div className="inline-block bg-stone-900 text-white px-6 py-3 rounded-2xl shadow-xl">
              <span className="text-3xl font-black tracking-tight">200₺</span>
              <span className="text-stone-400 font-medium ml-2">/ aylık</span>
            </div>
            <p className="text-[10px] text-stone-400 mt-3 font-bold uppercase tracking-widest">Sadece bir koli bandı fiyatına!</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 animate-in slide-in-from-bottom-8 duration-700 delay-300">
            <a href="https://wa.me/905550000000" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
              <Button 
                variant="primary" 
                size="md" 
                className="!rounded-full px-10 shadow-2xl w-full whitespace-nowrap text-[11px] font-black"
              >
                HEMEN DÜKKANIMI AÇMAK İSTİYORUM
              </Button>
            </a>
            <a href="https://toptanambalajcim.ekatalog.site" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
              <Button 
                variant="secondary" 
                size="md" 
                className="!rounded-full px-10 w-full whitespace-nowrap text-[11px] font-black"
              >
                ÖRNEK DÜKKANI İNCELE
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* BRANDING SECTION */}
      <section className="py-24 px-4 border-t border-stone-100 bg-stone-50/50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-tight">
              Müşterileriniz Size<br />Hayran Kalsın.
            </h2>
            <p className="text-lg text-stone-500 font-medium leading-relaxed">
              Fiyat listesi sormak isteyen müşterilerinize PDF veya liste göndermeyin. Onlara dükkanınıza özel, prestijli bir adres verin.
            </p>
            
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200/50">
                <h4 className="text-stone-900 font-black text-sm mb-1 uppercase tracking-wider">Bedava Web Sitesi Adı</h4>
                <p className="text-stone-500 text-sm font-medium">Dükkanınızın adı neyse adresiniz o olsun: <span className="text-stone-900 font-bold italic">sizin-isminiz.ekatalog.site</span></p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200/50">
                <h4 className="text-stone-900 font-black text-sm mb-1 uppercase tracking-wider">WhatsApp'tan Sipariş Hattı</h4>
                <p className="text-stone-500 text-sm font-medium">Müşteriniz ürünü seçsin, butona bassın, siparişi direkt cebinize gelsin.</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-md bg-stone-900 rounded-[3rem] p-10 aspect-[4/5] flex flex-col justify-between shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 text-white text-9xl font-black italic select-none">
               VIP
             </div>
             <div className="space-y-4 relative z-10">
                <div className="w-16 h-1 bg-white/20 rounded-full mb-8"></div>
                <h3 className="text-white text-3xl font-black tracking-tight leading-none">Kartvizitinizde<br />Harika Duracak.</h3>
                <p className="text-white/50 text-sm font-medium">Müşterileriniz linke tıkladığında dükkanınızın şıklığıyla karşılaşacak.</p>
             </div>
             <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between text-white text-xs font-bold uppercase tracking-[0.2em]">
                   <span>Dükkan Durumu</span>
                   <span className="flex items-center gap-2">
                     <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                     Açık
                   </span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-stone-900 tracking-tight uppercase">Sadece 3 Adımda Hazır.</h2>
            <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Teknoloji bilmenize gerek yok, biz her şeyi hallediyoruz.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              { step: "01", title: "Adınızı Belirleyin", desc: "Dükkanınızın web adresini seçin." },
              { step: "02", title: "Ürünleri Atın", desc: "Resimlerini çekin ve fiyatlarını yazın." },
              { step: "03", title: "Linkinizi Paylaşın", desc: "WhatsApp ve Instagram'dan duyurun." }
            ].map((s, i) => (
              <div key={i} className="space-y-4">
                <div className="text-6xl font-black text-stone-100 select-none">{s.step}</div>
                <h3 className="text-xl font-black text-stone-900 tracking-tight -mt-10">{s.title}</h3>
                <p className="text-stone-500 font-medium px-8 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-20 px-4 bg-stone-900 mx-4 rounded-[3rem] mb-20 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        <div className="max-w-3xl mx-auto text-center space-y-10 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
            Gelecek Dijitalde,<br />Dükkanınız Geride Kalmasın.
          </h2>
          <p className="text-stone-400 text-lg font-medium">
            Ayda sadece 200₺'ye dükkanınızı modernize edin.<br />Taahhüt yok, gizli ücret yok.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="https://wa.me/905550000000" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
              <Button 
                variant="primary" 
                size="lg" 
                className="!bg-white !text-stone-900 !rounded-full px-12 font-black shadow-xl"
              >
                HAYDİ, BEN DE VARIM!
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pb-20 text-center">
        <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.5em]">ekatalog.site © 2026 — HER DÜKKANA BİR WEB ADRESİ</p>
      </footer>
    </div>
  );
}
