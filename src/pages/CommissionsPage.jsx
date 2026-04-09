import { useMemo } from 'react';
import { Wallet, TrendingUp, Clock, Target } from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { formatCurrency, formatDate, calcCommissionStats } from '../utils/helpers';
import KPICard from '../components/KPICard';
import CommissionChart from '../components/CommissionChart';
import StatusBadge from '../components/StatusBadge';

export default function CommissionsPage() {
  const { leads } = useLeads();
  const stats = useMemo(() => calcCommissionStats(leads), [leads]);

  const convertedLeads = useMemo(() => {
    return leads
      .filter(l => l.status === 'Converti')
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [leads]);

  const pendingLeads = useMemo(() => {
    return leads
      .filter(l => !['Converti', 'Perdu'].includes(l.status))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [leads]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Mes Commissions</h1>
          <p>Suivez vos gains et commissions en temps réel</p>
        </div>
      </div>

      {/* Highlight card */}
      <div className="commission-summary">
        <div className="commission-highlight animate-fade-in stagger-1">
          <div className="kpi-label">Commission totale gagnée</div>
          <div className="kpi-value" style={{ fontSize: '2rem', marginTop: '8px' }}>
            {formatCurrency(stats.totalEarned)}
          </div>
        </div>
        <KPICard
          icon={TrendingUp}
          label="Ce mois"
          value={formatCurrency(stats.thisMonthEarned)}
          accentColor="var(--color-green)"
          bgColor="var(--color-green-bg)"
          delay={2}
        />
        <KPICard
          icon={Clock}
          label="Commission potentielle"
          value={formatCurrency(Math.round(stats.pendingEstimate))}
          accentColor="#F59E0B"
          bgColor="rgba(245, 158, 11, 0.1)"
          delay={3}
        />
        <KPICard
          icon={Target}
          label="Taux de conversion"
          value={`${stats.conversionRate}%`}
          accentColor="#8B5CF6"
          bgColor="rgba(139, 92, 246, 0.1)"
          delay={4}
        />
      </div>

      <div className="dashboard-grid">
        <CommissionChart />

        <div className="card animate-fade-in">
          <div className="card-header">
            <h3>Leads convertis ({convertedLeads.length})</h3>
          </div>
          <div className="card-body">
            {convertedLeads.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                Aucun lead converti pour le moment
              </p>
            ) : (
              <div className="activity-list">
                {convertedLeads.map(lead => (
                  <div key={lead.id} className="activity-item">
                    <div className="activity-dot" style={{ background: 'var(--color-converti)' }} />
                    <div className="activity-text">
                      <strong>{lead.contactName}</strong> — {lead.productType}
                      <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        {lead.commissionRate}% sur {formatCurrency(lead.estimatedPremium)}
                      </div>
                    </div>
                    <span className="commission-value" style={{ fontSize: '0.875rem' }}>
                      {formatCurrency(lead.commissionAmount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending commissions table */}
      <div className="card animate-fade-in" style={{ marginTop: 'var(--space-lg)' }}>
        <div className="card-header">
          <h3>Commissions en attente</h3>
        </div>
        <div className="card-body">
          {pendingLeads.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Aucun lead en attente
            </p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Produit</th>
                    <th>Statut</th>
                    <th>Prime estimée</th>
                    <th>Taux</th>
                    <th>Commission potentielle</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLeads.map(lead => (
                    <tr key={lead.id}>
                      <td>
                        <div className="lead-name">{lead.contactName}</div>
                      </td>
                      <td>{lead.productType}</td>
                      <td><StatusBadge status={lead.status} /></td>
                      <td>{formatCurrency(lead.estimatedPremium)}</td>
                      <td>{lead.commissionRate}%</td>
                      <td className="commission-value">
                        {formatCurrency(Math.round(lead.estimatedPremium * lead.commissionRate / 100))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
