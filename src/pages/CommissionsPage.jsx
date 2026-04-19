import { useState, useMemo } from 'react';
import { Wallet, TrendingUp, Clock, Target, Download, CheckCircle, Search, FileText } from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, calcCommissionStats, exportToCSV } from '../utils/helpers';
import KPICard from '../components/KPICard';
import CommissionChart from '../components/CommissionChart';
import StatusBadge from '../components/StatusBadge';

function AdminCommissionsView({ leads, partners, updateLeadStatus }) {
  const [search, setSearch] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());

  const unpaidLeads = useMemo(() => {
    return leads
      .filter(l => l.status === 'Converti' && l.commissionAmount > 0)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [leads]);

  const paidLeads = useMemo(() => {
    return leads.filter(l => l.status === 'Payé');
  }, [leads]);

  const totalUnpaid = unpaidLeads.reduce((acc, l) => acc + (l.commissionAmount || 0), 0);
  const totalPaid = paidLeads.reduce((acc, l) => acc + (l.commissionAmount || 0), 0);

  const filteredUnpaid = useMemo(() => {
    let res = unpaidLeads;
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(l => l.contactName?.toLowerCase().includes(q) || l.productType?.toLowerCase().includes(q));
    }
    if (selectedPartnerId) {
      res = res.filter(l => l.partnerId === selectedPartnerId);
    }
    return res;
  }, [unpaidLeads, search, selectedPartnerId]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredUnpaid.length && filteredUnpaid.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredUnpaid.map(l => l.id)));
    }
  };

  const getPartnerName = (pid) => {
    const p = partners?.find(x => x.id === pid);
    return p ? p.name : 'Inconnu';
  };

  const handleBatchPayment = async () => {
    if (selectedIds.size === 0) return;
    
    // Get full lead details for export
    const leadsToExport = filteredUnpaid.filter(l => selectedIds.has(l.id));
    
    // 1. Export to CSV
    exportToCSV(leadsToExport, `paiements_ordre_${new Date().toISOString().split('T')[0]}.csv`);
    
    // 2. Mark as Paid (Wait slightly to ensure download starts)
    for (const id of selectedIds) {
      await updateLeadStatus(id, 'Payé');
    }
    
    setSelectedIds(new Set());
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Centre de Paiement</h1>
          <p>Supervisez et soldez les commissions des partenaires</p>
        </div>
      </div>

      <div className="commission-summary" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #ef4444' }}>
           <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: '#ef4444' }}><Clock size={32} /></div>
           <div>
             <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Commissions en attente de paiement</div>
             <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>{formatCurrency(totalUnpaid)}</div>
           </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--color-green)' }}>
           <div style={{ padding: '16px', background: 'var(--color-green-bg)', borderRadius: '12px', color: 'var(--color-green)' }}><CheckCircle size={32} /></div>
           <div>
             <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Historique Payé</div>
             <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>{formatCurrency(totalPaid)}</div>
           </div>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--space-lg)' }}>
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={16} />
            <input type="text" placeholder="Rechercher un lead..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="table-filters">
            <select className="filter-select" value={selectedPartnerId} onChange={(e) => setSelectedPartnerId(e.target.value)}>
               <option value="">Tous les partenaires</option>
               {partners?.filter(p => p.role === 'partner').map(p => (
                 <option key={p.id} value={p.id}>{p.name}</option>
               ))}
            </select>
            {selectedIds.size > 0 && (
              <button className="btn btn-primary btn-sm" onClick={handleBatchPayment}>
                <FileText size={16} /> Exporter & Marquer comme Payé ({selectedIds.size})
              </button>
            )}
          </div>
        </div>

        <div className="table-container">
           {filteredUnpaid.length === 0 ? (
             <div className="table-empty">
                <CheckCircle size={32} style={{ color: 'var(--color-green)' }} />
                <p>Aucune commission en attente de paiement.</p>
             </div>
           ) : (
             <table className="data-table">
               <thead>
                 <tr>
                    <th style={{ width: '40px' }}><input type="checkbox" checked={selectedIds.size === filteredUnpaid.length && filteredUnpaid.length > 0} onChange={toggleSelectAll} style={{ cursor: 'pointer' }} /></th>
                    <th>Lead</th>
                    <th>Partenaire</th>
                    <th>Montant à payer</th>
                    <th>Validé le</th>
                 </tr>
               </thead>
               <tbody>
                  {filteredUnpaid.map(lead => (
                    <tr key={lead.id} className={selectedIds.has(lead.id) ? 'selected-row' : ''}>
                       <td><input type="checkbox" checked={selectedIds.has(lead.id)} onChange={() => toggleSelect(lead.id)} style={{ cursor: 'pointer' }} /></td>
                       <td>
                          <div className="lead-name">{lead.contactName}</div>
                          <div className="lead-company">{lead.productType}</div>
                       </td>
                       <td><span style={{ fontWeight: 500, color: 'var(--color-primary)' }}>{getPartnerName(lead.partnerId)}</span></td>
                       <td><strong style={{ color: '#ef4444' }}>{formatCurrency(lead.commissionAmount)}</strong></td>
                       <td>{formatDate(lead.updatedAt)}</td>
                    </tr>
                  ))}
               </tbody>
             </table>
           )}
        </div>
      </div>
    </div>
  );
}

function PartnerCommissionsView({ leads, stats }) {
  const convertedLeads = useMemo(() => leads.filter(l => l.status === 'Converti' || l.status === 'Payé').sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)), [leads]);
  const pendingLeads = useMemo(() => leads.filter(l => !['Converti', 'Payé', 'Perdu'].includes(l.status)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [leads]);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Mes Commissions</h1>
          <p>Suivez vos gains et commissions en temps réel</p>
        </div>
      </div>

      <div className="commission-summary">
        <div className="commission-highlight animate-fade-in stagger-1">
          <div className="kpi-label">Commission totale gagnée</div>
          <div className="kpi-value" style={{ fontSize: '2rem', marginTop: '8px' }}>
            {formatCurrency(stats.totalEarned)}
          </div>
        </div>
        <KPICard icon={TrendingUp} label="Ce mois" value={formatCurrency(stats.thisMonthEarned)} accentColor="var(--color-green)" bgColor="var(--color-green-bg)" delay={2} />
        <KPICard icon={Clock} label="Commission potentielle" value={formatCurrency(Math.round(stats.pendingEstimate))} accentColor="#F59E0B" bgColor="rgba(245, 158, 11, 0.1)" delay={3} />
        <KPICard icon={Target} label="Taux de conversion" value={`${stats.conversionRate}%`} accentColor="#8B5CF6" bgColor="rgba(139, 92, 246, 0.1)" delay={4} />
      </div>

      <div className="dashboard-grid">
        <CommissionChart />

        <div className="card animate-fade-in">
          <div className="card-header">
            <h3>Historique direct ({convertedLeads.length})</h3>
          </div>
          <div className="card-body">
            {convertedLeads.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Aucun lead converti pour le moment</p>
            ) : (
              <div className="activity-list">
                {convertedLeads.map(lead => (
                  <div key={lead.id} className="activity-item">
                    <div className="activity-dot" style={{ background: lead.status === 'Payé' ? 'var(--color-green)' : 'var(--color-converti)' }} />
                    <div className="activity-text">
                      <strong>{lead.contactName}</strong> — {lead.productType}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        <span>{lead.commissionRate}% sur {formatCurrency(lead.estimatedPremium)}</span>
                        {lead.status === 'Payé' && <span style={{ background: 'var(--color-green-bg)', color: 'var(--color-green)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Payé</span>}
                      </div>
                    </div>
                    <span className="commission-value" style={{ fontSize: '0.875rem' }}>{formatCurrency(lead.commissionAmount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card animate-fade-in" style={{ marginTop: 'var(--space-lg)' }}>
        <div className="card-header">
          <h3>Commissions en attente</h3>
        </div>
        <div className="card-body">
          {pendingLeads.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Aucun lead en attente</p>
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
                      <td><div className="lead-name">{lead.contactName}</div></td>
                      <td>{lead.productType}</td>
                      <td><StatusBadge status={lead.status} /></td>
                      <td>{formatCurrency(lead.estimatedPremium)}</td>
                      <td>{lead.commissionRate}%</td>
                      <td className="commission-value">{formatCurrency(Math.round(lead.estimatedPremium * lead.commissionRate / 100))}</td>
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

export default function CommissionsPage() {
  const { leads, updateLeadStatus } = useLeads();
  const { user, partners } = useAuth();
  
  const stats = useMemo(() => calcCommissionStats(leads), [leads]);

  if (user?.role === 'admin') {
     return <AdminCommissionsView leads={leads} partners={partners} updateLeadStatus={updateLeadStatus} />;
  }

  return <PartnerCommissionsView leads={leads} stats={stats} />;
}
