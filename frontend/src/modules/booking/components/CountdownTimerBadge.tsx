import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { CountdownResult } from '../hooks/useCountdownTimer';

export interface CountdownTimerBadgeProps {
  timer: CountdownResult;
  className?: string;
}

function getTimerStyle(isExpired: boolean, totalSeconds: number): string {
  if (isExpired) return 'bg-rose-50 border-rose-200 text-rose-700';
  if (totalSeconds < 900) return 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse';
  return 'bg-blue-50 border-blue-200 text-blue-700';
}

function ExpiredNotice(): React.JSX.Element {
  return (
    <div className="flex items-center gap-2 font-semibold">
      <AlertTriangle className="w-5 h-5 text-rose-500" />
      <span>Batas waktu pembayaran telah habis (Kedaluwarsa)</span>
    </div>
  );
}

function ActiveTimer({ formattedTime }: { formattedTime: string }): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <Clock className="w-5 h-5 text-blue-600" />
      <span className="text-sm font-medium">Sisa Waktu Pembayaran:</span>
      <span className="font-mono text-lg font-bold tracking-wider">{formattedTime}</span>
    </div>
  );
}

function TimerContent({ timer }: { timer: CountdownResult }): React.JSX.Element {
  return timer.isExpired ? <ExpiredNotice /> : <ActiveTimer formattedTime={timer.formattedTime} />;
}

export function CountdownTimerBadge({ timer, className = '' }: CountdownTimerBadgeProps): React.JSX.Element {
  const colorStyle = getTimerStyle(timer.isExpired, timer.totalSeconds);
  return (
    <div className={`p-4 rounded-xl border flex items-center justify-between shadow-xs ${colorStyle} ${className}`}>
      <TimerContent timer={timer} />
    </div>
  );
}
