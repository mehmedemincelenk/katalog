import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDiscount } from './useDiscount';

describe('useDiscount Hook (Number at End Logic)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should apply discount from any code ending with a number', () => {
    const { result } = renderHook(() => useDiscount());
    act(() => {
      result.current.applyCode('KOD25');
    });
    expect(result.current.activeDiscount?.rate).toBe(0.25);
  });

  it('should handle different prefixes correctly', () => {
    const { result } = renderHook(() => useDiscount());

    act(() => {
      result.current.applyCode('kodfs23');
    });
    expect(result.current.activeDiscount?.rate).toBe(0.23);

    act(() => {
      result.current.applyCode('kodasd25');
    });
    expect(result.current.activeDiscount?.rate).toBe(0.25);
  });

  it('should handle single digit numbers', () => {
    const { result } = renderHook(() => useDiscount());
    act(() => {
      result.current.applyCode('kodsa2');
    });
    expect(result.current.activeDiscount?.rate).toBe(0.02);
  });

  it('should fail if code does not end with a number', () => {
    const { result } = renderHook(() => useDiscount());
    act(() => {
      result.current.applyCode('MERHABA');
    });
    expect(result.current.activeDiscount).toBeNull();
    expect(result.current.error).toBe('Geçersiz kod!');
  });

  it('should fail if discount rate is out of bounds (e.g., 100)', () => {
    const { result } = renderHook(() => useDiscount());
    act(() => {
      result.current.applyCode('KOD100');
    });
    expect(result.current.activeDiscount).toBeNull();
    expect(result.current.error).toBe('Geçersiz indirim oranı!');
  });
});
