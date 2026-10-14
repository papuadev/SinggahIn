import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountdownTimer } from '../hooks/useCountdownTimer';

describe('useCountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes formattedTime correctly from future date', () => {
    const futureDate = new Date(Date.now() + 3600 * 1000 + 120 * 1000 + 45 * 1000); // 1h 2m 45s
    const { result } = renderHook(() => useCountdownTimer(futureDate));
    expect(result.current.isExpired).toBe(false);
    expect(result.current.formattedTime).toBe('01:02:45');
    expect(result.current.hours).toBe(1);
    expect(result.current.minutes).toBe(2);
    expect(result.current.seconds).toBe(45);
  });

  it('marks as expired when target date is in the past', () => {
    const pastDate = new Date(Date.now() - 5000);
    const { result } = renderHook(() => useCountdownTimer(pastDate));
    expect(result.current.isExpired).toBe(true);
    expect(result.current.formattedTime).toBe('00:00:00');
  });

  it('decrements countdown and triggers onExpire when reaches 0', () => {
    const onExpire = vi.fn();
    const futureDate = new Date(Date.now() + 2000); // 2 seconds
    const { result } = renderHook(() => useCountdownTimer(futureDate, onExpire));
    expect(result.current.formattedTime).toBe('00:00:02');

    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.formattedTime).toBe('00:00:01');

    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.isExpired).toBe(true);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});
