import { useMemo, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useLeads } from '../context/LeadContext';
import { formatCurrency } from '../utils/helpers';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366f1', '#EC4899', '#8B5CF6', '#14b8a6', '#f43f5e'];

export default function ProductMixChart(props) {
  const { leads: ctxLeads } = useLeads();
  const leads = props.leads || ctxLeads;
  const [metric, setMetric] = useState('value'); // 'value' | 'volume'

  const data = useMemo(() => {
    const productMap = {};
    leads.forEach(lead => {
      const type = lead.productType || 'Autre';
      if (!productMap[type]) productMap[type] = { name: type, value: 0, volume: 0 };
      productMap[type].volume += 1;
      
      const comm = lead.status === 'CONVERTI' || lead.status === 'PAYE' 
          ? (lead.commissionAmount || 0) 
          : ((lead.estimatedPremium || 0) * (lead.commissionRate || 0) / 100);
      productMap[type].value += comm;
    });

    return Object.values(productMap).sort((a, b) => b[metric] - a[metric]);
  }, [leads, metric]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <strong style={{ display: 'block', marginBottom: '8px' }}>{data.name}</strong>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
             <span style={{ color: 'var(--color-text-muted)' }}>Volume:</span> 
             <strong>{data.volume}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
             <span style={{ color: 'var(--color-text-muted)' }}>Valeur potentielle:</span> 
             <strong style={{ color: 'var(--color-green)' }}>{formatCurrency(data.value)}</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`card animate-fade-in ${props.className || 'dashboard-span-4'}`}>
      <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Mix Produit</h3>
        <select 
          className="filter-select" 
          value={metric} 
          onChange={(e) => setMetric(e.target.value)}
          style={{ padding: '4px 8px', fontSize: '0.8rem', height: 'auto', background: 'var(--color-bg)' }}
        >
          <option value="value">Par Valeur (€)</option>
          <option value="volume">Par Volume</option>
        </select>
      </div>
      <div className="card-body" style={{ padding: '16px 0 0 0' }}>
        {data.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>Aucune donnée</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={5}
                dataKey={metric}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
