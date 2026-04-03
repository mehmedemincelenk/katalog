import { describe, it, expect, vi } from 'vitest';
import { compressImage } from './image';

// Mocking some browser APIs that might be missing in jsdom or behave differently
if (typeof HTMLCanvasElement.prototype.toDataURL === 'undefined') {
  HTMLCanvasElement.prototype.toDataURL = vi.fn(
    () => 'data:image/jpeg;base64,mock',
  );
}

describe('image.js utils', () => {
  it('compressImage should return a promise', () => {
    const mockFile = new File([''], 'test.png', { type: 'image/png' });
    const result = compressImage(mockFile);
    expect(result).toBeInstanceOf(Promise);
  });

  // More complex tests would need actual Image/Canvas support in JSDOM,
  // which might require 'canvas' package. For now, this confirms basic setup.
});
