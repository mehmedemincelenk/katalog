import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProducts } from './useProducts';

// Global Fetch Mock Data
const mockProducts = Array.from({ length: 50 }, (_, i) => ({
  id: String(i + 1),
  name: `Ürün ${i + 1}`,
  category: i < 10 ? 'KÖPÜK' : 'DİĞER',
  price: '₺100,00',
  inStock: 'true',
  is_archived: 'false'
}));

const csvData = "id,name,category,price,inStock,is_archived\n" + 
  mockProducts.map(p => `${p.id},${p.name},${p.category},${p.price},${p.inStock},${p.is_archived}`).join("\n");

describe('useProducts Hook (Mimari Doğrulama)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.stubEnv('VITE_SHEET_URL', 'https://mock-sheet-url.com');

    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(csvData)
      });
    });
  });

  it('tüm ürünleri başarıyla çekmeli ve cachelemeli', async () => {
    const { result } = renderHook(() => useProducts('', [], false));
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    expect(result.current.products.length).toBe(50);
    const cached = localStorage.getItem('toptanambalaj_products_v12_data_cache');
    expect(cached).not.toBeNull();
  });

  it('arama terimine göre ürünleri filtrelemeli', async () => {
    const { result } = renderHook(() => useProducts('Ürün 10', [], false));
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    expect(result.current.products.every(p => p.name.includes('10'))).toBe(true);
  });

  it('kategoriye göre ürünleri filtrelemeli', async () => {
    const { result } = renderHook(() => useProducts('', ['KÖPÜK'], false));
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    expect(result.current.products.length).toBe(10);
    expect(result.current.products.every(p => p.category === 'KÖPÜK')).toBe(true);
  });

  it('Admin modunda arşivlenmiş ürünleri göstermeli', async () => {
    // Mock data'ya bir arşivli ürün ekle
    const dataWithArchive = csvData + "\n99,Arşivli Ürün,KÖPÜK,₺10,true,true";
    global.fetch = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, text: () => Promise.resolve(dataWithArchive) }));

    const { result } = renderHook(() => useProducts('', [], true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    expect(result.current.products.some(p => p.name === 'Arşivli Ürün')).toBe(true);
  });
});
