import { REFERENCES, REFERENCES_UI } from '../data/config';

/**
 * REFERENCES BİLEŞENİ (STRATEJİK ANALİZ)
 * -----------------------------------
 * Bir girişimci olarak bu alan senin "Sosyal Kanıt" (Social Proof) merkezindir.
 * 
 * 1. Güven İnşası: Müşteri, bildiği markaları (PTT, Trendyol vb.) seninle yan yana gördüğünde bilinçaltında sana olan güveni artar.
 * 2. Kurumsallık Algısı: Çalıştığın kurumlar, iş hacminin ve profesyonelliğinin bir göstergesidir.
 * 3. Minimalizm: Logo yerine emoji kullanımı hem sayfa hızını artırır hem de modern bir hava katar.
 */

export default function References() {
  const ui = REFERENCES_UI; // config.ts'deki tasarım ayarlarını aldık.

  return (
    <section className={`${ui.style.sectionBg} border-t ${ui.style.cardBorder} py-12 md:py-16`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* BAŞLIK: Sade ve otoriter bir ton kullanır. */}
        <h2 className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-8 md:mb-12">
          {ui.title}
        </h2>

        {/* LOGO IZGARASI: Mobil cihazlarda 2, masaüstünde 4 sütunlu düzen. */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8`}>
          {REFERENCES.map((ref) => (
            <div
              key={ref.id}
              className={`flex flex-col items-center justify-center gap-2 ${ui.style.cardBg} border ${ui.style.cardBorder} rounded-xl py-6 px-4 hover:border-stone-300 active:scale-95 transition-all shadow-sm`}
            >
              {/* Logo yerine şık ve hızlı emojiler. */}
              <span className="text-3xl" aria-hidden="true">
                {ref.logo}
              </span>
              {/* Marka Adı: Sade ve okunabilir. */}
              <span className="text-[11px] font-bold text-stone-500 text-center uppercase tracking-tighter">
                {ref.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
