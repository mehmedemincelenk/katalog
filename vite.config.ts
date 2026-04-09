import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite motorunun çalışma ayarlarını yapıyoruz.
// https://vitejs.dev/config/
export default defineConfig({
  // React eklentisini aktif ediyoruz ki .tsx dosyalarımızı anlayabilsin.
  plugins: [react()],
  
  // Sitemizi Github Pages gibi bir klasör altında yayınlayacaksak burayı ayarlarız.
  // '/' demek sitemiz ana dizinde (orneksite.com) çalışacak demektir.
  base: './',

  // Proje dosyalarımızı daha hızlı bulmak ve düzenli tutmak için
  // 'dist' klasörüne temiz bir çıktı almasını sağlıyoruz.
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
