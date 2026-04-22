import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useLeads } from '../context/LeadContext';
import { formatCurrency } from '../utils/helpers';

export default function CommissionChart(props) {
  const { leads } = useLeads();

  const data = useMemo(() => {
    // Build monthly data for the last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('fr-FR', { month: 'short' });
      months.push({ key, label, earned: 0, leads: 0 });
    }

    leads
      .filter(l => l.status === 'CONVERTI ET PAYE' && l.commissionAmount > 0)
      .forEach(lead => {
        const d = new Date(lead.updatedAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const month = months.find(m => m.key === key);
        if (month) {
          month.earned += lead.commissionAmount;
          month.leads += 1;
        }
      });

    return months;
  }, [leads]);

  return (
    <div className={`card animate-fade-in ${props.className || 'dashboard-span-6'}`}>
      <div className="card-header">
        <h3>Commissions (6 mois)</h3>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
            <defs>
              <linearGradient id="commGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10C27E" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10C27E" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              fontSize={11}
              tick={{ fill: '#64748B' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              fontSize={11}
              tick={{ fill: '#64748B' }}
              tickFormatter={(v) => `${v}€`}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                fontSize: '13px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                color: 'var(--color-text)',
              }}
              formatter={(value) => [formatCurrency(value), 'Commission']}
              cursor={{ stroke: '#10C27E', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="earned"
              stroke="#10C27E"
              strokeWidth={2.5}
              fill="url(#commGradient)"
              dot={{ fill: '#10C27E', r: 4, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
