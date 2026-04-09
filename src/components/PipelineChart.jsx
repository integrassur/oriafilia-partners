import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useLeads } from '../context/LeadContext';
import { STATUSES } from '../utils/seedData';

const STATUS_COLORS = {
  'Nouveau': '#3B82F6',
  'Contacté': '#8B5CF6',
  'Qualifié': '#F59E0B',
  'Devis envoyé': '#EC4899',
  'Converti': '#10B981',
  'Perdu': '#EF4444',
};

export default function PipelineChart() {
  const { leads } = useLeads();

  const data = useMemo(() => {
    return STATUSES.map(status => ({
      name: status,
      count: leads.filter(l => l.status === status).length,
      color: STATUS_COLORS[status],
    }));
  }, [leads]);

  return (
    <div className="card animate-fade-in">
      <div className="card-header">
        <h3>Pipeline des Leads</h3>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} barSize={36} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
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
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                fontSize: '13px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
              formatter={(value) => [`${value} lead(s)`, '']}
              cursor={{ fill: 'rgba(0, 51, 88, 0.04)' }}
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
