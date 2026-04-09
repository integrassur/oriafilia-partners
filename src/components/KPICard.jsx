import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICard({ icon: Icon, label, value, trend, trendLabel, accentColor, bgColor, delay = 0 }) {
  const style = {
    '--kpi-accent': accentColor || 'var(--color-green)',
    '--kpi-bg': bgColor || 'var(--color-green-bg)',
  };

  return (
    <div
      className={`kpi-card animate-fade-in stagger-${delay}`}
      style={style}
    >
      <div className="kpi-card-header">
        <div className="kpi-icon">
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <div className={`kpi-trend ${trend >= 0 ? 'up' : 'down'}`}>
            {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}
