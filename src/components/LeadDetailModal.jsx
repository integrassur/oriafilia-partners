import { useState } from 'react';
import { X } from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { useAuth } from '../context/AuthContext';
import { STATUSES } from '../utils/seedData';
import { formatDate, formatCurrency } from '../utils/helpers';
import StatusBadge from './StatusBadge';

export default function LeadDetailModal({ lead, onClose }) {
  const { updateLeadStatus, updateLead } = useLeads();
  const { user } = useAuth();
  const [newStatus, setNewStatus] = useState(lead.status);
  const [adminNotes, setAdminNotes] = useState(lead.notes || '');

  if (!lead) return null;

  const handleStatusChange = () => {
    if (newStatus !== lead.status) {
      updateLeadStatus(lead.id, newStatus);
    }
    if (user?.role === 'admin' && adminNotes !== lead.notes) {
      updateLead(lead.id, { notes: adminNotes });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" id="lead-detail-modal">
        <div className="modal-header">
          <h2>Détails du Lead</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ marginBottom: '20px' }}>
            <StatusBadge status={lead.status} />
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Contact</span>
              <span className="detail-value">{lead.contactName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">{lead.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Téléphone</span>
              <span className="detail-value">{lead.phone}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Produit</span>
              <span className="detail-value">{lead.productType}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Situation</span>
              <span className="detail-value">{lead.situation || '—'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Source</span>
              <span className="detail-value">{lead.source}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Commission</span>
              <span className="detail-value commission-value">
                {lead.status === 'CONVERTI' || lead.status === 'PAYE' ? formatCurrency(lead.commissionAmount) : 'En attente'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date de création</span>
              <span className="detail-value">{formatDate(lead.createdAt)}</span>
            </div>
            <div className="detail-item full-width">
              <span className="detail-label">Notes de l'Administrateur</span>
              {user?.role === 'admin' ? (
                <textarea
                  className="form-textarea"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Laisser un retour au partenaire..."
                  style={{ marginTop: '8px' }}
                />
              ) : (
                <span className="detail-value" style={{ 
                  backgroundColor: 'var(--color-bg-secondary)', 
                  padding: '12px', 
                  borderRadius: '6px', 
                  display: 'block',
                  marginTop: '4px'
                }}>
                  {lead.notes || "Aucun retour n'a encore été laissé sur ce prospect."}
                </span>
              )}
            </div>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="modal-footer">
            <div className="status-select-group">
              <label htmlFor="status-change">Changer le statut :</label>
              <select
                id="status-change"
                className="filter-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleStatusChange}
              disabled={newStatus === lead.status && adminNotes === (lead.notes || '')}
              id="update-status-btn"
            >
              Mettre à jour
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
