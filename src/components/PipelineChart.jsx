import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useLeads } from '../context/LeadContext';
import { STATUSES } from '../utils/seedData';

const STATUS_COLORS = {
  'NOUVEAU': '#9ca3af',
  'CONTACTE': '#3b82f6',
  'FAUX NUMERO': '#ef4444',
  'QUALIFIE': '#f59e0b',
  'CONVERTI ET PAYE': '#10b981'
};

export default function PipelineChart(props) {
  const { leads: ctxLeads } = useLeads();
  const leads = props.leads || ctxLeads;

  const data = useMemo(() => {
    return STATUSES.map(status => ({
      name: status,
      count: leads.filter(l => l.status === status).length,
      color: STATUS_COLORS[status],
    }));
  }, [leads]);

  return (
    <div className={`card animate-fade-in ${props.className || ''}`}>
      <div className="card-header">
        <h3>Pipeline des Leads</h3>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barSize={36} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="name"
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
              allowDecimals={false}
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
              formatter={(value) => [`${value} lead(s)`, '']}
              cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
