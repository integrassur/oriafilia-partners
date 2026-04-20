import { useAuth } from '../context/AuthContext';
import { useLeads } from '../context/LeadContext';
import { formatDate, formatCurrency, calcCommissionStats } from '../utils/helpers';
import { Mail, Calendar, Shield, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { leads } = useLeads();
  const stats = useMemo(() => calcCommissionStats(leads), [leads]);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="page-container animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>Mon Profil</h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '4px', fontSize: '0.875rem' }}>
            Consultez vos informations de compte
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 500px)', justifyContent: 'center', gap: '24px' }}>
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar-lg">{initials}</div>
            <div className="profile-info">
              <h2 style={{ fontSize: '1.2rem', marginBottom: '4px', color: 'var(--color-text)' }}>{user?.name || user?.email?.split('@')[0]}</h2>
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
    </div>
  );
}
