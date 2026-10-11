import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export interface BackButtonProps {
  label?: string;
  fallbackUrl?: string;
  className?: string;
  to?: string;
}

function useBackHandler(to?: string, fallbackUrl = '/'): () => void {
  const navigate = useNavigate();
  return () => {
    if (to) navigate(to);
    else if (window.history.length > 1) navigate(-1);
    else navigate(fallbackUrl);
  };
}

export function BackButton({
  label = 'Kembali',
  fallbackUrl = '/',
  className = '',
  to,
}: BackButtonProps): React.JSX.Element {
  const handleBack = useBackHandler(to, fallbackUrl);
  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={label}
      className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors group cursor-pointer ${className}`}
    >
      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
      <span>{label}</span>
    </button>
  );
}
