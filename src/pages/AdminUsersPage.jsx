import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabaseClient';
import { Users, Mail, Calendar, Shield, Link, Copy, Check, X, AlertCircle, Eye } from 'lucide-react';

const APP_URL = 'https://oriafilia-partners.vercel.app';

export default function AdminUsersPage() {
  const { user, partners, updateUserRole, togglePartnerStatus, resetPartnerPassword } = useAuth();
  const [roleChangeModal, setRoleChangeModal] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [newPassword, setNewPassword] = useState('');
  const [resetPasswordStatus, setResetPasswordStatus] = useState('');
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);



  const handleToggleStatus = async () => {
    if (!selectedPartner) return;
    setIsTogglingStatus(true);
    const { error } = await togglePartnerStatus(selectedPartner.id, selectedPartner.status || 'active');
    if (!error) {
       setSelectedPartner({ ...selectedPartner, status: selectedPartner.status === 'active' ? 'inactive' : 'active' });
    }
    setIsTogglingStatus(false);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setResetPasswordStatus('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setResetPasswordStatus('loading');
    const { error } = await resetPartnerPassword(selectedPartner.id, newPassword);
    if (error) {
      setResetPasswordStatus('Erreur : ' + error.message);
    } else {
      setResetPasswordStatus('success');
      setNewPassword('');
    }
  };

  // Invitation state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [copied, setCopied] = useState(false);

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

  const handleGenerateInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    if (!inviteEmail.trim() || !/\S+@\S+\.\S+/.test(inviteEmail)) {
      setInviteError('Veuillez entrer une adresse e-mail valide.');
      return;
    }

    setInviteLoading(true);
    try {
      const { data, error } = await supabase
        .from('invitations')
        .insert([{ email: inviteEmail.trim().toLowerCase(), created_by: user.id }])
        .select()
        .single();

      if (error) throw error;

      setInviteLink(`${APP_URL}/invite/${data.token}`);
      setInviteEmail('');
    } catch (err) {
      setInviteError("Erreur lors de la création de l'invitation : " + err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const resetInviteModal = () => {
    setShowInviteModal(false);
    setInviteLink('');
    setInviteEmail('');
    setInviteError('');
  };

  return (
    <div className="page-container animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>Gestion des Courtiers</h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '4px', fontSize: '0.875rem' }}>
            {partners.length} partenaire{partners.length !== 1 ? 's' : ''} enregistré{partners.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
          <Link size={16} />
          Inviter un Partenaire
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
              <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map(p => (
              <tr key={p.id}>
                <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(16,194,126,0.2), rgba(14,165,233,0.2))',
                    color: 'var(--color-green)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.95rem', flexShrink: 0
                  }}>
                    {(p.name || p.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {p.name || '—'}

                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} style={{ opacity: 0.5 }} />
                    {p.email}
                  </span>
                </td>
                <td>
                  {p.id === user.id ? (
                    <span className="status-badge converti" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Shield size={12} />
                      Admin
                    </span>
                  ) : (
                    <select
                      className="filter-select"
                      style={{ padding: '4px 8px', fontSize: '0.875rem', height: 'auto' }}
                      value={p.role}
                      onChange={(e) => handleRoleChangeRequest(p, e.target.value)}
                    >
                      <option value="partner">Partenaire</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  )}
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} style={{ opacity: 0.5 }} />
                    {new Date(p.joinedAt).toLocaleDateString('fr-FR')}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelectedPartner(p)} style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
                    <Eye size={14} style={{ marginRight: '4px' }} /> Profil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal - Invitation */}
      {showInviteModal && (
        <div className="premium-modal-overlay" onClick={resetInviteModal}>
          <div className="premium-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="premium-modal-header">
              <h2>Inviter un partenaire</h2>
              <button className="modal-close" onClick={resetInviteModal}><X size={18} /></button>
            </div>

            <div className="premium-modal-body">
              {!inviteLink ? (
                <>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>
                    Entrez l'adresse email du partenaire. Un lien d'invitation unique (valide 7 jours) sera généré — copiez-le et envoyez-le lui.
                  </p>
                  <form onSubmit={handleGenerateInvite} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {inviteError && (
                      <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: '8px', color: '#ef4444', fontSize: '0.875rem' }}>
                        {inviteError}
                      </div>
                    )}
                    <div className="form-group">
                      <label>Adresse e-mail du partenaire</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="courtier@exemple.com"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="premium-modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={resetInviteModal}>Annuler</button>
                      <button type="submit" className="btn btn-primary" disabled={inviteLoading}>
                        <Link size={16} />
                        {inviteLoading ? 'Génération...' : 'Générer le lien'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ padding: '16px', background: 'rgba(16,194,126,0.05)', border: '1px solid rgba(16,194,126,0.2)', borderRadius: '10px' }}>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                      🔗 Lien d'invitation généré (valide 7 jours) :
                    </p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <code style={{
                        flex: 1, padding: '10px 12px', background: 'var(--color-bg)',
                        borderRadius: '8px', fontSize: '0.8rem', wordBreak: 'break-all',
                        border: '1px solid var(--color-border)'
                      }}>
                        {inviteLink}
                      </code>
                      <button className="btn btn-primary btn-sm" onClick={handleCopy} title="Copier">
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    {copied && <p style={{ fontSize: '0.8rem', color: 'var(--color-green)', marginTop: '8px' }}>✓ Copié dans le presse-papiers !</p>}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    Envoyez ce lien au partenaire par email ou message. Il devra créer son mot de passe via ce lien.
                  </p>
                  <div className="premium-modal-footer">
                    <button className="btn btn-secondary" onClick={resetInviteModal}>Fermer</button>
                    <button className="btn btn-primary" onClick={() => setInviteLink('')}>
                      <Link size={16} />
                      Nouvelle invitation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal - Changement de rôle */}
      {roleChangeModal && (
        <div className="premium-modal-overlay" onClick={() => setRoleChangeModal(null)}>
          <div className="premium-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="premium-modal-header">
              <h2 style={{ fontSize: '1.1rem' }}>Confirmer le changement de rôle</h2>
              <button className="modal-close" onClick={() => setRoleChangeModal(null)}><X size={18} /></button>
            </div>
            <div className="premium-modal-body" style={{ lineHeight: '1.6' }}>
              Changer le rôle de <strong>{roleChangeModal.partnerName}</strong> :
              <div style={{ margin: '12px 0', padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '8px' }}>
                <strong>{roleChangeModal.currentRole}</strong> → <strong style={{ color: roleChangeModal.newRole === 'admin' ? 'var(--color-green)' : 'currentColor' }}>{roleChangeModal.newRole}</strong>
              </div>
              {roleChangeModal.newRole === 'admin' && (
                <p style={{ fontSize: '0.875rem', color: '#ef4444' }}>
                  ⚠️ Cet utilisateur aura un accès complet d'administration.
                </p>
              )}
            </div>
            <div className="premium-modal-footer">
              <button className="btn btn-secondary" onClick={() => setRoleChangeModal(null)}>Annuler</button>
              <button className="btn btn-primary" onClick={confirmRoleChange}>Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Détails Partenaire */}
      {selectedPartner && (
        <div className="premium-modal-overlay" onClick={() => setSelectedPartner(null)}>
          <div className="premium-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="premium-modal-header">
              <h2 style={{ fontSize: '1.25rem' }}>Profil complet du partenaire</h2>
              <button className="modal-close" onClick={() => setSelectedPartner(null)}><X size={18} /></button>
            </div>
            
            <div className="premium-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '20px' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: selectedPartner.role === 'admin' 
                      ? 'linear-gradient(135deg, rgba(244,63,94,0.1), rgba(249,115,22,0.1))'
                      : 'linear-gradient(135deg, rgba(16,194,126,0.15), rgba(14,165,233,0.15))',
                    color: selectedPartner.role === 'admin' ? '#f43f5e' : 'var(--color-green)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '1.4rem'
                  }}>
                    {(selectedPartner.name || selectedPartner.email).charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{selectedPartner.name || 'Non renseigné'}</h3>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} /> {selectedPartner.email}
                    </div>
                  </div>

               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                 
                 <div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.05em' }}>Statut du compte</div>
                   <div style={{ fontSize: '0.95rem' }}>
                     {selectedPartner.status === 'active' 
                       ? <span className="text-green flex gap-1"><Check size={16} /> Actif</span> 
                       : <span style={{ color: '#ef4444' }}>Inactif</span>}
                   </div>
                 </div>
                 
                 
                 

                 
                 

                 {/* Master Control Section */}
                 {selectedPartner.role !== 'admin' && (
                   <div style={{ gridColumn: '1 / -1', marginTop: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
                     <h4 className="danger-zone-header">
                        <Shield size={18} /> Actions Administratives (Master Control)
                     </h4>
                     
                     <div className="danger-zone">
                       <div className="danger-action-row">
                         <div>
                           <strong style={{ display: 'block', marginBottom: '4px' }}>Statut du compte</strong>
                           <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Suspendre l'accès bloquera la connexion du courtier.</span>
                         </div>
                         <button 
                           className={`btn ${selectedPartner.status === 'inactive' ? 'btn-primary' : 'btn-outline'}`} 
                           onClick={handleToggleStatus}
                           disabled={isTogglingStatus}
                           style={{ borderColor: '#ef4444', color: selectedPartner.status === 'inactive' ? '#fff' : '#ef4444', background: selectedPartner.status === 'inactive' ? '#ef4444' : 'transparent' }}
                         >
                           {isTogglingStatus ? 'Chargement...' : selectedPartner.status === 'inactive' ? 'Réactiver le compte' : 'Suspendre le compte'}
                         </button>
                       </div>

                       <div className="danger-action-row" style={{ display: 'block' }}>
                         <strong style={{ display: 'block', marginBottom: '12px' }}>Forcer un nouveau mot de passe</strong>
                         <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                           Définissez manuellement un mot de passe temporaire à communiquer personnellement au partenaire.
                         </p>
                         <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                           <div style={{ display: 'flex', gap: '12px' }}>
                             <input 
                               type="text" 
                               className="form-input" 
                               placeholder="Nouveau mot de passe" 
                               value={newPassword}
                               onChange={(e) => { setNewPassword(e.target.value); setResetPasswordStatus(''); }}
                               style={{ flex: 1, borderColor: 'rgba(239, 68, 68, 0.3)' }}
                             />
                             <button 
                               className="btn btn-secondary" 
                               onClick={handleResetPassword}
                               disabled={!newPassword || resetPasswordStatus === 'loading'}
                               style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                             >
                               {resetPasswordStatus === 'loading' ? 'Mise à jour...' : 'Appliquer'}
                             </button>
                           </div>
                           
                           {resetPasswordStatus === 'success' && (
                             <div className="text-green flex gap-1" style={{ fontSize: '0.875rem' }}>
                               <Check size={16} /> Mot de passe mis à jour avec succès
                             </div>
                           )}
                           
                           {resetPasswordStatus && resetPasswordStatus !== 'loading' && resetPasswordStatus !== 'success' && (
                             <div style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                               {resetPasswordStatus}
                             </div>
                           )}
                        </div>
                     </div>
                   </div>
                 </div>
                 )}
               </div>

            </div>
            <div className="premium-modal-footer">
              <button className="btn btn-secondary" onClick={() => { setSelectedPartner(null); setNewPassword(''); setResetPasswordStatus(''); }}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
