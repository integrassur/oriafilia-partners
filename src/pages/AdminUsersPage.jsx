import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, Mail, Calendar, Shield } from 'lucide-react';

export default function AdminUsersPage() {
  const { user, partners, addPartner, updateUserRole } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [roleChangeModal, setRoleChangeModal] = useState(null);
  
  // Create partner form
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('Tous les champs sont requis.');
      return;
    }
    if (partners.some(p => p.email.toLowerCase() === form.email.toLowerCase())) {
      setError('Cet email est déjà utilisé.');
      return;
    }
    addPartner(form.name.trim(), form.email.trim(), form.password);
    setShowModal(false);
    setForm({ name: '', email: '', password: '' });
    setError('');
  };

  const handleRoleChangeRequest = (partner, newRole) => {
    setRoleChangeModal({
      partnerId: partner.id,
      partnerName: partner.name,
      currentRole: partner.role,
      newRole
    });
  };

  const confirmRoleChange = () => {
    if (roleChangeModal) {
      updateUserRole(roleChangeModal.partnerId, roleChangeModal.newRole);
      setRoleChangeModal(null);
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Gestion des Courtiers</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <UserPlus size={18} />
          Nouveau Partenaire
        </button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Date d'inscription</th>
            </tr>
          </thead>
          <tbody>
            {partners.map(p => (
              <tr key={p.id}>
                <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    backgroundColor: 'rgba(16, 194, 126, 0.1)',
                    color: 'var(--color-green)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 600, fontSize: '0.9rem'
                  }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  {p.name}
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} style={{ opacity: 0.5 }} />
                    {p.email}
                  </span>
                </td>
                <td>
                  {p.id === user.id ? (
                    <span className={`status-badge converti`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Shield size={12} />
                      {p.role}
                    </span>
                  ) : (
                    <select 
                      className="filter-select"
                      style={{ padding: '4px 8px', fontSize: '0.875rem', height: 'auto', backgroundColor: p.role === 'Administrateur' ? 'rgba(16, 194, 126, 0.1)' : 'transparent' }}
                      value={p.role}
                      onChange={(e) => handleRoleChangeRequest(p, e.target.value)}
                    >
                      <option value="Partner">Partner</option>
                      <option value="Administrateur">Administrateur</option>
                    </select>
                  )}
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} style={{ opacity: 0.5 }} />
                    {new Date(p.joinedAt).toLocaleDateString('fr-FR')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ajouter un partenaire</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              {error && <div className="form-error" style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', marginBottom: '8px' }}>{error}</div>}
              
              <div className="form-group">
                <label>Nom complet</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Jean Dupont"
                />
              </div>
              <div className="form-group">
                <label>Adresse e-mail</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="jean.dupont@oriafilia.com"
                />
              </div>
              <div className="form-group">
                <label>Mot de passe provisoire</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="Mot de passe"
                />
              </div>
              
              <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Créer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {roleChangeModal && (
        <div className="modal-overlay" onClick={() => setRoleChangeModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.1rem' }}>Confirmer le changement de rôle</h2>
              <button className="modal-close" onClick={() => setRoleChangeModal(null)}>&times;</button>
            </div>
            
            <div style={{ marginTop: '16px', lineHeight: '1.5' }}>
              Êtes-vous sûr de vouloir changer le rôle de <strong>{roleChangeModal.partnerName}</strong> ?
              <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Mise à jour :</span> <strong>{roleChangeModal.currentRole}</strong> → <strong style={{ color: roleChangeModal.newRole === 'Administrateur' ? 'var(--color-green)' : 'currentColor' }}>{roleChangeModal.newRole}</strong>
              </div>
              {roleChangeModal.newRole === 'Administrateur' && (
                <p style={{ marginTop: '12px', fontSize: '0.875rem', color: '#ef4444' }}>
                  Attention : Cet utilisateur aura un accès complet d'administration à la plateforme.
                </p>
              )}
            </div>
            
            <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setRoleChangeModal(null)}>
                Annuler
              </button>
              <button type="button" className="btn btn-primary" onClick={confirmRoleChange}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
