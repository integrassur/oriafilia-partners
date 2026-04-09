import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, CheckCircle, Wallet, PlusCircle } from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, calcCommissionStats, timeAgo } from '../utils/helpers';
import KPICard from '../components/KPICard';
import PipelineChart from '../components/PipelineChart';
import CommissionChart from '../components/CommissionChart';
import StatusBadge from '../components/StatusBadge';

export default function DashboardPage() {
  const { leads, adminPartnerFilter, setAdminPartnerFilter } = useLeads();
  const { user, partners } = useAuth();
  const navigate = useNavigate();

  const stats = useMemo(() => calcCommissionStats(leads), [leads]);

  const recentLeads = useMemo(() => {
    return [...leads]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);
  }, [leads]);

  const pendingCount = leads.filter(l => !['Converti', 'Perdu'].includes(l.status)).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Bonjour, {user?.name} 👋</h1>
          <p>Voici un aperçu de votre activité</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {user?.role === 'Administrateur' && (
            <select 
              className="form-select" 
              value={adminPartnerFilter} 
              onChange={(e) => setAdminPartnerFilter(e.target.value)}
              style={{ padding: '8px 14px', minWidth: '200px' }}
            >
              <option value="">Tous les partenaires</option>
              {partners && partners.filter(p => p.role === 'Partner').map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
              ))}
            </select>
          )}

          <button className="btn btn-primary" onClick={() => navigate('/submit')} id="dashboard-new-lead-btn">
            <PlusCircle size={18} />
            Nouveau Lead
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <KPICard
          icon={Users}
          label="Total Leads"
          value={leads.length}
          trend={12}
          accentColor="#3B82F6"
          bgColor="rgba(59, 130, 246, 0.1)"
          delay={1}
        />
        <KPICard
          icon={Clock}
          label="En cours"
          value={pendingCount}
          accentColor="#F59E0B"
          bgColor="rgba(245, 158, 11, 0.1)"
          delay={2}
        />
        <KPICard
          icon={CheckCircle}
          label="Convertis"
          value={`${stats.convertedCount} (${stats.conversionRate}%)`}
          accentColor="#10B981"
          bgColor="rgba(16, 185, 129, 0.1)"
          delay={3}
        />
        <KPICard
          icon={Wallet}
          label="Commission totale"
          value={formatCurrency(stats.totalEarned)}
          trend={8}
          accentColor="var(--color-green)"
          bgColor="var(--color-green-bg)"
          delay={4}
        />
      </div>

      <div className="dashboard-grid">
        <PipelineChart />
        <CommissionChart />
      </div>

      <div className="card animate-fade-in">
        <div className="card-header">
          <h3>Activité récente</h3>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/leads')}>
            Voir tout
          </button>
        </div>
        <div className="card-body">
          {recentLeads.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Aucune activité récente
            </p>
          ) : (
            <div className="activity-list">
              {recentLeads.map(lead => (
                <div key={lead.id} className="activity-item">
                  <div className="activity-dot" style={{
                    background: lead.status === 'Converti' ? 'var(--color-converti)' :
                      lead.status === 'Perdu' ? 'var(--color-perdu)' : 'var(--color-green)'
                  }} />
                  <div className="activity-text">
                    <strong>{lead.contactName}</strong> — {lead.productType}
                    <div style={{ marginTop: '4px' }}>
                      <StatusBadge status={lead.status} />
                    </div>
                  </div>
                  <span className="activity-time">{timeAgo(lead.updatedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
