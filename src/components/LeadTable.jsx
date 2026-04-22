import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Download, Inbox, User } from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { useAuth } from '../context/AuthContext';
import { STATUSES, PRODUCT_TYPES } from '../utils/seedData';
import { formatDate, formatCurrency, exportToCSV } from '../utils/helpers';
import StatusBadge from './StatusBadge';

export default function LeadTable({ onSelectLead }) {
  const { leads, adminPartnerFilter, setAdminPartnerFilter } = useLeads();
  const { user, partners } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

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

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.contactName.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.company?.toLowerCase().includes(q) ||
        l.productType.toLowerCase().includes(q) ||
        l.phone.includes(q)
      );
    }

    // Filters
    if (statusFilter) result = result.filter(l => l.status === statusFilter);
    if (productFilter) result = result.filter(l => l.productType === productFilter);

    // Sort
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

  const renderSortHeader = (field, label) => (
    <th
      className={sortField === field ? 'sorted' : ''}
      onClick={() => toggleSort(field)}
      style={{ cursor: 'pointer' }}
    >
      {label}
      <span className="sort-icon" style={{ marginLeft: '4px', opacity: sortField === field ? 1 : 0.5 }}>
        <ArrowUpDown size={12} />
      </span>
    </th>
  );

  return (
    <>
      <div className="table-toolbar">
        <div className="table-search">
          <Search />
          <input
            type="text"
            placeholder="Rechercher un lead..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="lead-search-input"
          />
        </div>

        <div className="table-filters">
          {user?.role === 'admin' && (
            <select
              className="filter-select"
              value={adminPartnerFilter}
              onChange={(e) => setAdminPartnerFilter(e.target.value)}
              id="admin-partner-filter"
            >
              <option value="">Tous les partenaires</option>
              {partners && partners.filter(p => p.role === 'partner').map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
              ))}
            </select>
          )}

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            id="status-filter"
          >
            <option value="">Tous les statuts</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            id="product-filter"
          >
            <option value="">Tous les produits</option>
            {PRODUCT_TYPES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => exportToCSV(filtered)}
            title="Exporter en CSV"
            id="export-csv-btn"
          >
            <Download size={16} />
            CSV
          </button>
        </div>
      </div>

      <div className="table-container">
        {filtered.length === 0 ? (
          <div className="table-empty">
            <Inbox />
            <p>Aucun lead trouvé</p>
          </div>
        ) : (
          <table className="data-table" id="leads-table">
            <thead>
              <tr>
                {renderSortHeader('contactName', 'Contact')}
                {renderSortHeader('productType', 'Produit')}
                {renderSortHeader('source', 'Source')}
                {renderSortHeader('status', 'Statut')}
                {renderSortHeader('commissionAmount', 'Commission')}
                {renderSortHeader('createdAt', 'Date')}
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id} onClick={() => onSelectLead?.(lead)}>
                  <td>
                    <div className="lead-name">{lead.contactName}</div>
                    <div className="lead-company">{lead.email}</div>
                  </td>
                  <td>{lead.productType}</td>
                  <td>{lead.source}</td>
                  <td><StatusBadge status={lead.status} /></td>
                  <td>
                    {lead.status === 'CONVERTI ET PAYE' ? (
                      <span className="commission-value">{formatCurrency(lead.commissionAmount)}</span>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                    )}
                  </td>
                  <td>{formatDate(lead.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: '12px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
        {filtered.length} lead{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''}
      </div>
    </>
  );
}
