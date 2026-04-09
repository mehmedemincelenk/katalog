import '@testing-library/jest-dom';
import { vi } from 'vitest';

/**
 * TEST LABORATUVARI KURULUMU (Vitest)
 * Bu dosya, testler çalışmadan önce sahte bir tarayıcı ortamı hazırlar.
 */

// Tarayıcıdaki bazı özellikleri (localStorage gibi) test ortamında taklit ediyoruz.
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Kaydırma (scroll) fonksiyonlarını taklit ediyoruz.
window.scrollTo = vi.fn();
