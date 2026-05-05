import { Link } from 'wouter';
import { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  message: string;
  ctaLabel?: string;
  ctaTo?: string;
}

export function EmptyState({ icon: Icon, message, ctaLabel, ctaTo }: Props) {
  return (
    <div className="empty-state">
      <Icon size={48} className="empty-state__icon" strokeWidth={1} />
      <p className="empty-state__msg">{message}</p>
      {ctaLabel && ctaTo && (
        <Link to={ctaTo} className="btn btn--ghost btn--sm">{ctaLabel}</Link>
      )}
    </div>
  );
}
