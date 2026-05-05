import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
  trend?: number;
}

export function KpiCard({ icon: Icon, label, value, color, trend }: Props) {
  return (
    <div className="kpi-card">
      <div className="kpi-card__header">
        <span className="kpi-card__label">{label}</span>
        <div className="kpi-card__icon" style={{ background: `${color}1a` }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      <div className="kpi-card__value">{value}</div>
      {trend !== undefined && (
        <div className={`kpi-card__trend ${trend >= 0 ? 'kpi-card__trend--up' : 'kpi-card__trend--down'}`}>
          {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{Math.abs(trend).toFixed(1)}% vs last period</span>
        </div>
      )}
    </div>
  );
}
