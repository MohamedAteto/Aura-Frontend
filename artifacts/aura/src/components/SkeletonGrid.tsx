interface Props {
  count?: number;
}

export function SkeletonGrid({ count = 8 }: Props) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton" style={{ aspectRatio: '1' }} />
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="skeleton" style={{ height: 10, width: '40%' }} />
            <div className="skeleton" style={{ height: 14, width: '80%' }} />
            <div className="skeleton" style={{ height: 12, width: '60%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
