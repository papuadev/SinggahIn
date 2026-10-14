import React from 'react';

export function MinimalistLoadingTransition(): React.JSX.Element {
  return (
    <div role="status" className="flex flex-col items-center justify-center py-10 space-y-4 text-center animate-fade-in">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-12 h-12 rounded-full bg-primary-100/70 animate-ping opacity-60" />
        <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-primary-600 animate-spin" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-gray-900">Kata Sandi Berhasil Diperbarui</h3>
        <p className="text-xs text-gray-500">Mengalihkan ke halaman masuk...</p>
      </div>
    </div>
  );
}
