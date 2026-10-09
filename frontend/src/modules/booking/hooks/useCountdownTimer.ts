import { useState, useEffect, useRef } from 'react';

export interface CountdownResult {
  hours: number;
  minutes: number;
  seconds: number;
  formattedTime: string;
  isExpired: boolean;
  totalSeconds: number;
}

function pad(num: number): string {
  return num.toString().padStart(2, '0');
}

function calculateRemaining(targetMs: number) {
  const diff = targetMs - Date.now();
  if (diff <= 0) return { h: 0, m: 0, s: 0, total: 0, expired: true };
  const total = Math.floor(diff / 1000);
  return { h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: total % 60, total, expired: false };
}

function toCountdownResult(r: ReturnType<typeof calculateRemaining>): CountdownResult {
  return {
    hours: r.h, minutes: r.m, seconds: r.s,
    formattedTime: `${pad(r.h)}:${pad(r.m)}:${pad(r.s)}`,
    isExpired: r.expired, totalSeconds: r.total,
  };
}

function useCountdownEffect(targetMs: number, setState: (c: CountdownResult) => void, onExpire?: () => void) {
  const onExpireRef = useRef(onExpire);
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);
  useEffect(() => {
    if (!targetMs) return;
    setState(toCountdownResult(calculateRemaining(targetMs)));
    const interval = setInterval(() => {
      const res = toCountdownResult(calculateRemaining(targetMs));
      setState(res);
      if (res.isExpired) { clearInterval(interval); onExpireRef.current?.(); }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetMs, setState]);
}

export function useCountdownTimer(targetDate?: string | Date | null, onExpire?: () => void): CountdownResult {
  const targetMs = targetDate ? new Date(targetDate).getTime() : 0;
  const [state, setState] = useState<CountdownResult>(() => toCountdownResult(calculateRemaining(targetMs)));
  useCountdownEffect(targetMs, setState, onExpire);
  return state;
}
