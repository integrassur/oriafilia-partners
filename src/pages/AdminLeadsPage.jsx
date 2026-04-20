import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Download, Inbox, Trash2, CheckCircle, X, LayoutList, LayoutGrid, Users } from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { useAuth } from '../context/AuthContext';
import { STATUSES, PRODUCT_TYPES } from '../utils/seedData';
import { formatDate, formatCurrency, exportToCSV } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';
import LeadDetailModal from '../components/LeadDetailModal';
import CsvImportBtn from '../components/CsvImportBtn';

export default function AdminLeadsPage() {
  const { leads, adminPartnerFilter, setAdminPartnerFilter, deleteLead, updateLeadStatus, updateLead } = useLeads();
  const { user, partners } = useAuth();

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Quick Edit State
  const [quickEditLead, setQuickEditLead] = useState(null);
  const [quickStatus, setQuickStatus] = useState('');
  const [quickCommission, setQuickCommission] = useState('');
  const [quickPartnerId, setQuickPartnerId] = useState('');

  if (user?.role !== 'admin') {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <h2>Accès refusé</h2>
        <p>Cette page est réservée aux administrateurs.</p>
      </div>
    );
  }

  const getPartnerName = (partnerId) => {
    const p = partners?.find(pt => pt.id === partnerId);
    return p ? p.name : '—';
  };

  const getPartnerInitials = (partnerId) => {
    const p = partners?.find(pt => pt.id === partnerId);
    return p ? (p.name || p.email).charAt(0).toUpperCase() : '?';
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const filtered = useMemo(() => {
    let result = [...leads];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.contactName?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.productType?.toLowerCase().includes(q) ||
        l.phone?.includes(q)
      );
    }

    if (statusFilter) result = result.filter(l => l.status === statusFilter);
    if (productFilter) result = result.filter(l => l.productType === productFilter);

    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [leads, search, statusFilter, productFilter, sortField, sortDir]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(l => l.id)));
    }
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await deleteLead(id);
    }
    setSelectedIds(new Set());
    setShowDeleteConfirm(false);
  };

  const handleQuickEditSave = () => {
    if (!quickEditLead) return;
    
    // Status update
    if (quickStatus !== quickEditLead.status || quickCommission !== quickEditLead.commissionAmount?.toString()) {
      const commission = quickStatus === 'Converti' ? Number(quickCommission) || 0 : null;
      updateLeadStatus(quickEditLead.id, quickStatus, commission);
    }
    
    // Partner reassign update
    if (quickPartnerId !== quickEditLead.partnerId) {
       updateLead(quickEditLead.id, { partnerId: quickPartnerId });
    }

    setQuickEditLead(null);
  };

  const openQuickEdit = (e, lead) => {
    e.stopPropagation();
    setQuickEditLead(lead);
    setQuickStatus(lead.status);
    setQuickCommission(lead.commissionAmount?.toString() || '');
    setQuickPartnerId(lead.partnerId);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Global Leads Center</h1>
          <p>Supervisez et réassignez l'ensemble du pipeline commercial</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: 'var(--color-bg)', padding: '4px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <button 
                onClick={() => setViewMode('list')} 
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none' }}
            >
                <LayoutList size={16} /> Liste
            </button>
            <button 
                onClick={() => setViewMode('kanban')} 
                className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none' }}
            >
                <LayoutGrid size={16} /> Kanban
            </button>
        </div>
      </div>

      <div className="table-advanced-container">
        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="table-search">
            <Search />
            <input
              type="text"
              placeholder="Rechercher un lead..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-filters">
            <select className="filter-select" value={adminPartnerFilter} onChange={(e) => setAdminPartnerFilter(e.target.value)}>
              <option value="">Tous les partenaires</option>
              {partners && partners.filter(p => p.role === 'partner').map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
              ))}
            </select>

            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tous les statuts</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select className="filter-select" value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
              <option value="">Tous les produits</option>
              {PRODUCT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <button className="btn btn-secondary btn-sm" onClick={() => exportToCSV(filtered)} title="Exporter en CSV">
              <Download size={16} /> CSV
            </button>

            {selectedIds.size > 0 && viewMode === 'list' && (
              <button
                className="btn btn-sm"
                onClick={() => setShowDeleteConfirm(true)}
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                <Trash2 size={16} /> Supprimer ({selectedIds.size})
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="table-empty">
            <Inbox />
            <p>Aucun lead trouvé</p>
          </div>
        ) : viewMode === 'list' ? (
          /* =========================================================
             VUE LISTE
             ========================================================= */
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} style={{ cursor: 'pointer' }} />
                  </th>
                  <th className={sortField === 'contactName' ? 'sorted' : ''} onClick={() => toggleSort('contactName')} style={{ cursor: 'pointer' }}>Contact <span className="sort-icon"><ArrowUpDown size={12} /></span></th>
                  <th>Partenaire</th>
                  <th className={sortField === 'productType' ? 'sorted' : ''} onClick={() => toggleSort('productType')} style={{ cursor: 'pointer' }}>Produit <span className="sort-icon"><ArrowUpDown size={12} /></span></th>
                  <th className={sortField === 'status' ? 'sorted' : ''} onClick={() => toggleSort('status')} style={{ cursor: 'pointer' }}>Statut <span className="sort-icon"><ArrowUpDown size={12} /></span></th>
                  <th className={sortField === 'commissionAmount' ? 'sorted' : ''} onClick={() => toggleSort('commissionAmount')} style={{ cursor: 'pointer' }}>Commission <span className="sort-icon"><ArrowUpDown size={12} /></span></th>
                  <th className={sortField === 'createdAt' ? 'sorted' : ''} onClick={() => toggleSort('createdAt')} style={{ cursor: 'pointer' }}>Date <span className="sort-icon"><ArrowUpDown size={12} /></span></th>
                  <th style={{ width: '80px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => (
                  <tr key={lead.id}>
                    <td>
                      <input type="checkbox" checked={selectedIds.has(lead.id)} onChange={() => toggleSelect(lead.id)} onClick={e => e.stopPropagation()} style={{ cursor: 'pointer' }} />
                    </td>
                    <td onClick={() => setSelectedLead(lead)} style={{ cursor: 'pointer' }}>
                      <div className="lead-name">{lead.contactName}</div>
                      <div className="lead-company">{lead.email}</div>
                    </td>
                    <td>
                      <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', display: 'inline-flex', alignItems: 'center', gap: '6px'}}>
                        <div style={{width: '16px', height: '16px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px'}}>{getPartnerInitials(lead.partnerId)}</div>
                         {getPartnerName(lead.partnerId)}
                      </span>
                    </td>
                    <td>{lead.productType}</td>
                    <td>
                      <div onClick={(e) => openQuickEdit(e, lead)} title="Éditer le lead (Statut / Réassignation)" style={{ cursor: 'pointer' }}>
                        <StatusBadge status={lead.status} />
                      </div>
                    </td>
                    <td>
                      {lead.status === 'Converti' ? (
                        <span className="commission-value">{formatCurrency(lead.commissionAmount)}</span>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td>{formatDate(lead.createdAt)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-sm btn-outline" onClick={() => setSelectedLead(lead)} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Détails</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* =========================================================
             VUE KANBAN
             ========================================================= */
          <div className="kanban-board">
            {STATUSES.map(status => {
              const columnLeads = filtered.filter(l => l.status === status);
              return (
                <div key={status} className="kanban-column">
                  <div className="kanban-column-header">
                    <div style={{ flex: 1 }}><StatusBadge status={status} /></div>
                    <span className="kanban-column-count">{columnLeads.length}</span>
                  </div>
                  <div className="kanban-column-body">
                     {columnLeads.map(lead => (
                       <div key={lead.id} onClick={(e) => openQuickEdit(e, lead)} className="kanban-card">
                          <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '4px' }}>{lead.contactName}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>{lead.productType}</div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--color-border-light)' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text)' }}>
                                <Users size={12} /> {getPartnerName(lead.partnerId)}
                             </div>
                             {lead.status === 'Converti' && (
                               <strong className="text-green" style={{ fontSize: '0.85rem' }}>{formatCurrency(lead.commissionAmount)}</strong>
                             )}
                          </div>
                       </div>
                     ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedLead && (
        <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}

      {quickEditLead && (
        <div className="premium-modal-overlay" onClick={() => setQuickEditLead(null)}>
          <div className="premium-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="premium-modal-header">
              <h2 style={{ fontSize: '1.1rem' }}>Édition Rapide : {quickEditLead.contactName}</h2>
              <button className="modal-close" onClick={() => setQuickEditLead(null)}><X size={18} /></button>
            </div>
            <div className="premium-modal-body">
              
              <div className="form-group">
                <label>Réassigner le propriétaire du lead</label>
                <select className="form-select" value={quickPartnerId} onChange={(e) => setQuickPartnerId(e.target.value)}>
                   {partners && partners.filter(p => p.role === 'partner').map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                   ))}
                </select>
              </div>

              <div className="form-group">
                <label>Nouveau statut</label>
                <select className="form-select" value={quickStatus} onChange={(e) => setQuickStatus(e.target.value)}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {quickStatus === 'Converti' && (
                <div className="form-group">
                  <label>Commission validée (€)</label>
                  <input type="number" className="form-input" value={quickCommission} onChange={(e) => setQuickCommission(e.target.value)} placeholder="Montant final de la commission" />
                </div>
              )}
            </div>
            </div>
            <div className="premium-modal-footer">
              <button className="btn btn-secondary" onClick={() => setQuickEditLead(null)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleQuickEditSave}><CheckCircle size={16} /> Mettre à jour</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="premium-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="premium-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="premium-modal-header">
              <h2 style={{ fontSize: '1.1rem' }}>Confirmer la suppression</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}><X size={18} /></button>
            </div>
            <div className="premium-modal-body">
              <p>Supprimer <strong>{selectedIds.size}</strong> lead{(selectedIds.size > 1 ? 's' : '')} ?</p>
              <p style={{ fontSize: '0.875rem', color: '#ef4444', marginTop: '8px' }}>⚠️ Cette action est irréversible.</p>
            </div>
            </div>
            <div className="premium-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Annuler</button>
              <button className="btn" onClick={handleBulkDelete} style={{ background: '#ef4444', color: '#fff' }}>
                <Trash2 size={16} /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
