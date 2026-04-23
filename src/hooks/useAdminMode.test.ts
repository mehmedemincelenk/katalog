import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAdminMode } from './useAdminMode';


vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn((fnName: string, args: { target_slug: string; input_pin: string }) => {
      if (fnName === 'verify_admin_access') {
        if (args.input_pin === '1234') {
          return Promise.resolve({ data: true, error: null });
        }
        return Promise.resolve({ data: false, error: null });
      }
      return Promise.resolve({ data: null, error: { message: 'Not found' } });
    }),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    })),
  },
}));

// Mock STORE_SLUG
vi.mock('../utils/store', () => ({
  getActiveStoreSlug: vi.fn(() => 'test-store-slug'),
}));

describe('useAdminMode (Security & Workflow Tests)', () => {
  it('should start with non-admin mode and modal closed', () => {
    const { result } = renderHook(() => useAdminMode());
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isPinModalOpen).toBe(false);
  });

  it('should successfully verify a correct PIN (mocked success)', async () => {
    const { result } = renderHook(() => useAdminMode());

    let isSuccess = false;
    await act(async () => {
      isSuccess = await result.current.verifyPinWithServer('1234');
    });

    expect(isSuccess).toBe(true);
  });

  it('should fail verification with empty or invalid PIN (mocked scenario)', async () => {
    const { result } = renderHook(() => useAdminMode());

    // We can simulate a failure by changing the mock for this specific test if needed,
    // but the default logic already handles STORE_SLUG check.

    let isSuccess = true;
    await act(async () => {
      isSuccess = await result.current.verifyPinWithServer('');
    });

    expect(isSuccess).toBe(false);
  });

  it('should toggle modal state correctly', () => {
    const { result } = renderHook(() => useAdminMode());

    act(() => {
      result.current.setIsPinModalOpen(true);
    });
    expect(result.current.isPinModalOpen).toBe(true);

    act(() => {
      result.current.setIsPinModalOpen(false);
    });
    expect(result.current.isPinModalOpen).toBe(false);
  });

  it('should confirm admin status after onPinSuccess', () => {
    const { result } = renderHook(() => useAdminMode());

    act(() => {
      result.current.onPinSuccess();
    });

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isPinModalOpen).toBe(false);
  });
});
