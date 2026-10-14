import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}

export function StarRatingInput({ value, onChange, disabled }: StarRatingInputProps): React.JSX.Element {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Rating bintang">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hover || value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-1 cursor-pointer transition-transform hover:scale-110 disabled:cursor-not-allowed focus:outline-none"
            aria-label={`${star} bintang`}
          >
            <Star className={`w-6 h-6 transition-colors ${isFilled ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
          </button>
        );
      })}
    </div>
  );
}

export function StarRatingDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }): React.JSX.Element {
  const sz = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sz} ${star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );
}
