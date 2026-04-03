# Görev: TypeScript'e Geçiş ve Kalite Standartları

Bu görev, mevcut React (JS) projesini TypeScript'e dönüştürmeyi ve kod standartlarını (ESLint/Prettier) oturtmayı amaçlar.

## 1. Hazırlık ve Altyapı
- Gerekli bağımlılıkları kur: `typescript`, `@types/react`, `@types/react-dom`, `eslint`, `prettier`, `eslint-config-prettier`, `eslint-plugin-react-hooks`.
- `tsconfig.json` dosyasını oluştur (Vite + React standartlarına uygun).
- `.eslintrc.cjs` (veya `eslint.config.js`) ve `.prettierrc` dosyalarını oluştur.
- **Standartlar:** 
  - Tek tırnak (`'`), semikolon (`true`), 2 boşluk tab.
  - TypeScript strict kuralları aktif.
  - Kaydetme anında otomatik düzeltme (lint-on-save) yapısını kurgula.

## 2. Tip Tanımlamaları (Interfaces)
`src/types` klasörü oluştur ve şu modelleri tanımla:
- **Product:** `id`, `name`, `category`, `price`, `image`, `description`, `inStock`, `is_archived`.
- **Category:** `name`, `display_order`.
- **SearchLog:** `timestamp`, `term`.

## 3. Dosya Dönüşümü (.js/.jsx -> .ts/.tsx)
- **Hooks:** `useProducts.ts`, `useAdminMode.ts`, `useCarousel.ts`. (En kritik kısımlar).
- **Utils:** `image.ts`.
- **Components:** Tüm `.jsx` dosyalarını `.tsx` yap ve propları tiplendir.
- **Data:** `config.ts`, `products.ts`.

## 4. Temizlik ve Doğrulama
- Tüm `any` tiplerinden kaçın, doğru interfaceleri kullan.
- JSDoc açıklamalarını TypeScript tipleriyle senkronize et.
- `npm run build` komutunun hatasız çalıştığını doğrula.
- Mevcut `Vitest` testlerini TS uyumlu hale getir.

**Önemli:** Google Sheets bağlantı mantığını (`PapaParse`, `fetch`) bozmadan tiplendir.
