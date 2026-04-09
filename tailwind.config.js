/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind'e diyoruz ki: "Şu klasörlerdeki tüm .tsx dosyalarına bak ve oradaki stilleri hazırla."
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Projeye özel renklerimizi buraya ekliyoruz.
      // Artık kod yazarken 'text-kraft-600' diyerek bu rengi çağırabiliriz.
      colors: {
        kraft: {
          50: '#f7f5f2',   // Çok açık krem
          100: '#ece6de',
          600: '#a68b7c',  // Toprak tonu (ana kraft rengi)
          700: '#8c7165',
          800: '#735a52',
          900: '#5c4741',  // Koyu kahve
        },
      },
      // Kendi özel animasyonlarımızı buraya tanımlıyoruz.
      animation: {
        'in': 'fade-in 0.5s ease-out', // Sayfa öğelerinin pürüzsüzce gelmesi
      },
    },
  },
  // Ek özellikler (Form tasarımları, animasyon kütüphaneleri vb.)
  plugins: [
    require('tailwindcss-animate'),
  ],
}
