const STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const statusIndex: Record<string, number> = {
  Pending: 0,
  Processing: 1,
  Shipped: 2,
  Delivered: 3,
  Cancelled: -1,
};

interface Props {
  status: string;
}

export function StatusStepper({ status }: Props) {
  const current = statusIndex[status] ?? 0;

  if (status === 'Cancelled') {
    return (
      <div style={{ padding: '0 1.25rem 0.75rem' }}>
        <span className="status-badge status-badge--cancelled">Cancelled</span>
      </div>
    );
  }

  return (
    <div className="stepper">
      {STEPS.map((step, i) => (
        <div
          key={step}
          className={`stepper__step ${i < current ? 'stepper__step--done' : ''} ${i === current ? 'stepper__step--active' : ''}`}
        >
          <div className="stepper__dot">
            {i < current && (
              <svg width="12" height="12" viewBox="0 0 12 12" style={{ position: 'absolute', inset: 0, margin: 'auto' }}>
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="stepper__label">{step}</span>
        </div>
      ))}
    </div>
  );
}
