import { Star } from 'lucide-react';

interface Props {
  rating: number;
  size?: number;
}

export function StarRating({ rating, size = 14 }: Props) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          fill={i <= Math.round(rating) ? '#a78bfa' : 'none'}
          color={i <= Math.round(rating) ? '#a78bfa' : 'hsl(256 22% 35%)'}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}
