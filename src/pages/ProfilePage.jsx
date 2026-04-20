import { useAuth } from '../context/AuthContext';
import { useLeads } from '../context/LeadContext';
import { formatDate, formatCurrency, calcCommissionStats } from '../utils/helpers';
import { User, Mail, Calendar, Shield, TrendingUp, AlertCircle, CheckCircle, Save } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { leads } = useLeads();
  const stats = useMemo(() => calcCommissionStats(leads), [leads]);

  const [form, setForm] = useState({
    full_name: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || ''
      });
    }
  }, [user]);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const isProfileComplete = form.full_name;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    // Nettoyage avant envoi
    const updates = {
      full_name: form.full_name?.trim() || null
    };

    const { error } = await updateProfile(updates);
    
    if (error) {
      setMessage({ type: 'error', text: "Erreur lors de l'enregistrement : " + error.message });
    } else {
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });
      setTimeout(() => setMessage(''), 3000);
    }
    setSaving(false);
  };

  return (
    <div className="page-container animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>Mon Profil</h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '4px', fontSize: '0.875rem' }}>
            Gérez vos informations de compte personnelles
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', alignItems: 'start' }} className="profile-grid">
        
        {/* Colonne gauche : Profil base et Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar-lg">{initials}</div>
              <div className="profile-info">
                <h2 style={{ fontSize: '1.2rem', marginBottom: '4px', color: 'var(--color-text)' }}>{user?.name}</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  {user?.role === 'admin' ? 'Administrateur' : 'Partenaire'}
                </p>
              </div>
            </div>

            <div className="profile-details">
              <div className="profile-row">
                <span className="profile-row-label">
                  <Mail size={14} style={{ marginRight: '8px' }} />
                  Email
                </span>
                <span className="profile-row-value">{user?.email}</span>
              </div>
              <div className="profile-row">
                <span className="profile-row-label">
                  <Shield size={14} style={{ marginRight: '8px' }} />
                  Rôle
                </span>
                <span className="profile-row-value" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
              </div>
              <div className="profile-row">
                <span className="profile-row-label">
                  <Calendar size={14} style={{ marginRight: '8px' }} />
                  Membre depuis
                </span>
                <span className="profile-row-value">{formatDate(user?.joinedAt)}</span>
              </div>
            </div>
            
            {!user?.role || user?.role !== 'admin' ? (
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)' }}>
                  <TrendingUp size={16} style={{ color: 'var(--color-primary)' }} />
                  VOS PERFORMANCES
                </h3>
                <div className="profile-details">
                  <div className="profile-row">
                    <span className="profile-row-label">Total Leads soumis</span>
                    <span className="profile-row-value">{leads.length}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-row-label">Commission totale</span>
                    <span className="profile-row-value commission-value" style={{ fontWeight: 'bold' }}>{formatCurrency(stats.totalEarned)}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Colonne droite : Formulaire */}
        <div className="profile-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text)', margin: 0 }}>Informations Personnelles</h2>
            {isProfileComplete ? (
              <span className="status-badge gagne" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center' }}>
                <CheckCircle size={14} style={{ marginRight: '6px' }} /> Profil Complet
              </span>
            ) : (
              <span className="status-badge perdu" style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'inline-flex', alignItems: 'center' }}>
                <AlertCircle size={14} style={{ marginRight: '6px' }} /> Profil Incomplet
              </span>
            )}
          </div>

          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '32px', lineHeight: '1.5' }}>
            Afin de pouvoir traiter vos leads, 
            veuillez renseigner votre nom complet. Les informations contractuelles figurent sur l'accord signé virtuellement.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {message && (
              <div style={{ 
                padding: '12px 16px', 
                borderRadius: '8px', 
                fontSize: '0.875rem',
                backgroundColor: message.type === 'success' ? 'rgba(16, 194, 126, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: message.type === 'success' ? 'var(--color-green)' : '#ef4444',
                border: `1px solid ${message.type === 'success' ? 'rgba(16, 194, 126, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
              }}>
                {message.text}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '20px' }}>
              <div className="form-group">
                <label>Nom Complet (ou Raison Sociale) *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={form.full_name} 
                  onChange={e => setForm({...form, full_name: e.target.value})} 
                  placeholder="Ex: Jean Dupont"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={16} />
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>

      </div>
      
      <style>{`
        @media (min-width: 900px) {
          .profile-grid {
            grid-template-columns: 1fr 2fr !important;
          }
        }
      `}</style>
    </div>
  );
}
