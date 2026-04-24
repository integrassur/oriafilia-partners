import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, CheckCircle, Wallet, PlusCircle, Trophy, AlertTriangle } from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, calcCommissionStats, timeAgo, getPartnerLeaderboard } from '../utils/helpers';
import KPICard from '../components/KPICard';
import PipelineChart from '../components/PipelineChart';
import CommissionChart from '../components/CommissionChart';
import ProductMixChart from '../components/ProductMixChart';
import StatusBadge from '../components/StatusBadge';

// --- Partner Dashboard View ---
function PartnerDashboardView({ leads, user, navigate }) {
  const stats = useMemo(() => calcCommissionStats(leads), [leads]);
  const recentLeads = useMemo(() => [...leads].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5), [leads]);
  const pendingCount = leads.filter(l => !['CONVERTI ET PAYE', 'FAUX NUMERO'].includes(l.status)).length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Bonjour, {user?.name} 👋</h1>
          <p>Voici un aperçu de votre activité</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/submit')} id="dashboard-new-lead-btn">
          <PlusCircle size={18} />
          Nouveau Lead
        </button>
      </div>

      <div className="kpi-grid">
        <KPICard icon={Users} label="Mes Leads" value={leads.length} trend={12} accentColor="#3B82F6" bgColor="rgba(59, 130, 246, 0.1)" delay={1} />
        <KPICard icon={Clock} label="En cours" value={pendingCount} accentColor="#F59E0B" bgColor="rgba(245, 158, 11, 0.1)" delay={2} />
        <KPICard icon={CheckCircle} label="Convertis" value={`${stats.convertedCount} (${stats.conversionRate}%)`} accentColor="#10B981" bgColor="rgba(16, 185, 129, 0.1)" delay={3} />
        <KPICard icon={Wallet} label="Mes Gains" value={formatCurrency(stats.totalEarned)} accentColor="var(--color-green)" bgColor="var(--color-green-bg)" delay={4} />
      </div>

      <div className="dashboard-grid">
        <PipelineChart />
        <CommissionChart />
      </div>

      <div className="card dashboard-span-12 animate-fade-in">
        <div className="card-header">
          <h3>Activité récente</h3>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/leads')}>Voir tout</button>
        </div>
        <div className="card-body">
          {recentLeads.length === 0 ? (
            <p className="text-muted">Aucune activité récente</p>
          ) : (
            <div className="activity-list">
              {recentLeads.map(lead => (
                <div key={lead.id} className="activity-item">
                  <div className="activity-dot" style={{ background: lead.status === 'CONVERTI ET PAYE' ? 'var(--color-converti)' : lead.status === 'FAUX NUMERO' ? 'var(--color-perdu)' : 'var(--color-green)' }} />
                  <div className="activity-text">
                    <strong>{lead.contactName}</strong> — {lead.productType}
                    <div style={{ marginTop: '4px' }}><StatusBadge status={lead.status} /></div>
                  </div>
                  <span className="activity-time">{timeAgo(lead.updatedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// --- Admin Cockpit View ---
function AdminDashboardView({ leads: allLeads, partners, navigate }) {
  const [timeRange, setTimeRange] = useState('all');

  const leads = useMemo(() => {
    if (timeRange === 'all') return allLeads;
    const now = new Date();
    const cutoff = new Date();
    if (timeRange === 'month') {
      cutoff.setMonth(now.getMonth() - 1);
    } else if (timeRange === 'quarter') {
      cutoff.setMonth(now.getMonth() - 3);
    } else if (timeRange === 'ytd') {
      cutoff.setMonth(0);
      cutoff.setDate(1);
    }
    return allLeads.filter(l => new Date(l.createdAt) >= cutoff);
  }, [allLeads, timeRange]);

  const stats = useMemo(() => calcCommissionStats(leads), [leads]);
  const leaderboard = useMemo(() => getPartnerLeaderboard(leads, partners), [leads, partners]);
  const activePartners = partners?.filter(p => p.role === 'partner' && p.status !== 'inactive').length || 0;

  return (
    <>
      <div className="page-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '24px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>📡</span> Cockpit Administrateur
          </h1>
          <p className="text-muted">Vue consolidée du réseau de partenaires et des flux globaux.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <select 
            className="filter-select"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ padding: '8px 12px', background: 'var(--color-bg)', fontWeight: 600 }}
          >
            <option value="all">Tout l'historique</option>
            <option value="month">Ce mois (30j)</option>
            <option value="quarter">Ce trimestre (90j)</option>
            <option value="ytd">Depuis le 1er Janvier</option>
          </select>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/users')}>Gestion Partenaires</button>
          <button className="btn btn-primary" onClick={() => navigate('/submit')}><PlusCircle size={18} /> Créer un lead</button>
        </div>
      </div>

      <div className="kpi-grid">
        <KPICard icon={Users} label="Total Leads (Réseau)" value={leads.length} accentColor="#6366f1" bgColor="rgba(99, 102, 241, 0.1)" delay={1} />
        <KPICard icon={CheckCircle} label="Taux de conversion global" value={`${stats.conversionRate}%`} trend={stats.conversionRate > 20 ? 5 : -2} accentColor="#10B981" bgColor="rgba(16, 185, 129, 0.1)" delay={2} />
        <KPICard icon={Wallet} label="Commissions Globales Dues" value={formatCurrency(stats.totalEarned)} accentColor="#f43f5e" bgColor="rgba(244, 63, 94, 0.1)" delay={3} />
        <KPICard icon={Users} label="Partenaires Actifs" value={activePartners} accentColor="#0ea5e9" bgColor="rgba(14, 165, 233, 0.1)" delay={4} />
      </div>

      <div className="admin-dashboard-grid">
        {/* Section Leaderboard Complet */}
        <div className="card dashboard-span-12 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Trophy size={20} color="#F59E0B" /> Palmarès des Courtiers (Leaderboard)</h3>
          </div>
          <div className="card-body" style={{ padding: '0', maxHeight: '400px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead style={{ position: 'sticky', top: 0, background: 'var(--color-surface)', zIndex: 10 }}>
                <tr>
                  <th>Courtier</th>
                  <th>Leads Soumis</th>
                  <th>Taux Conv.</th>
                  <th>Délai Moyen</th>
                  <th>Panier Moyen</th>
                  <th>CA Généré</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((partner, index) => (
                  <tr key={partner.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: index < 3 ? 'var(--color-primary-light)' : 'var(--color-bg)', color: index < 3 ? 'var(--color-primary)' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>{index + 1}</div>
                        <strong>{partner.name}</strong>
                      </div>
                    </td>
                    <td>{partner.leadCount}</td>
                    <td>
                       <span style={{ color: partner.stats.conversionRate > 20 ? 'var(--color-green)' : 'var(--color-text)', fontWeight: 600 }}>{partner.stats.conversionRate}%</span>
                       <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{partner.stats.convertedCount} conv.</div>
                    </td>
                    <td>{partner.stats.avgConversionTimeDays > 0 ? `${partner.stats.avgConversionTimeDays} jours` : '-'}</td>
                    <td>{formatCurrency(partner.stats.averageCart)}</td>
                    <td style={{ fontWeight: '600', color: 'var(--color-green)' }}>{formatCurrency(partner.stats.totalEarned)}</td>
                  </tr>
                ))}
                {leaderboard.length === 0 && <tr><td colSpan="6" className="text-center text-muted">Aucune donnée disponible.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inactive & Alertes */}
        <div className="card dashboard-span-12 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
             <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={20} color="#ef4444" /> Partenaires Inactifs (0 Lead)</h3>
          </div>
          <div className="card-body" style={{ padding: '0' }}>
             <table className="data-table">
              <thead>
                <tr>
                  <th>Courtier</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.filter(p => p.leadCount === 0).slice(0, 5).map(partner => (
                  <tr key={partner.id}>
                    <td>
                       <strong>{partner.name}</strong><br/>
                       <span className="text-muted" style={{ fontSize: '12px' }}>{partner.email}</span>
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/users')}>Gérer</button>
                    </td>
                  </tr>
                ))}
                {leaderboard.filter(p => p.leadCount === 0).length === 0 && <tr><td colSpan="2" className="text-center text-muted">Aucun partenaire inactif.</td></tr>}
              </tbody>
             </table>
          </div>
        </div>
      </div>
      
      <div className="admin-dashboard-grid" style={{ marginTop: '24px' }}>
        <PipelineChart leads={leads} className="dashboard-span-4" />
        <ProductMixChart leads={leads} className="dashboard-span-4" />
        <CommissionChart className="dashboard-span-4" />
      </div>
    </>
  );
}

// --- Main Container ---
export default function DashboardPage() {
  const { leads } = useLeads();
  const { user, partners } = useAuth();
  const navigate = useNavigate();

  if (user?.role === 'admin') {
    return <AdminDashboardView leads={leads} partners={partners} navigate={navigate} />;
  }

  return <PartnerDashboardView leads={leads} user={user} navigate={navigate} />;
}
