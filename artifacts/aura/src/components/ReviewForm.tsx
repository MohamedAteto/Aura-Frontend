import { useState } from 'react';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import api from '../lib/api';

interface Props {
  productId: number;
  onSubmitted: () => void;
}

export function ReviewForm({ productId, onSubmitted }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { toast.error('Please select a rating'); return; }
    setLoading(true);
    try {
      await api.post(`/api/Products/${productId}/reviews`, { rating, comment });
      toast.success('Review submitted!');
      onSubmitted();
    } catch (ex: any) {
      toast.error(ex?.response?.data?.message || 'Could not submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ background: 'hsl(258 30% 12%)', border: '1px solid hsl(258 26% 20%)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'hsl(256 22% 70%)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Write a review</h3>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <button key={i} type="button" onClick={() => setRating(i)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
            <Star size={22} fill={(hover || rating) >= i ? '#a78bfa' : 'none'} color={(hover || rating) >= i ? '#a78bfa' : 'hsl(256 22% 35%)'} strokeWidth={1.5} />
          </button>
        ))}
      </div>
      <textarea
        className="input"
        placeholder="Share your thoughts… (optional)"
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={3}
        style={{ resize: 'vertical' }}
      />
      <button type="submit" className="btn btn--primary btn--sm" disabled={loading} style={{ alignSelf: 'flex-start' }}>
        {loading ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  );
}
