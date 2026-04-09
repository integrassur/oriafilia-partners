import { useAuth } from '../context/AuthContext';
import { useLeads } from '../context/LeadContext';
import { formatDate, formatCurrency, calcCommissionStats } from '../utils/helpers';
import { User, Mail, Calendar, Shield, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { leads } = useLeads();
  const stats = useMemo(() => calcCommissionStats(leads), [leads]);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Mon Profil</h1>
          <p>Informations de votre compte partenaire</p>
        </div>
      </div>

      <div className="profile-card animate-fade-in">
        <div className="profile-header">
          <div className="profile-avatar-lg">{initials}</div>
          <div className="profile-info">
            <h2>{user?.name}</h2>
            <p>{user?.role} — Oriafilia Partners</p>
          </div>
        </div>

        <div className="profile-details">
          <div className="profile-row">
            <span className="profile-row-label">
              <Mail size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Email
            </span>
            <span className="profile-row-value">{user?.email}</span>
          </div>
          <div className="profile-row">
            <span className="profile-row-label">
              <Shield size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Rôle
            </span>
            <span className="profile-row-value">{user?.role}</span>
          </div>
          <div className="profile-row">
            <span className="profile-row-label">
              <Calendar size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Membre depuis
            </span>
            <span className="profile-row-value">{formatDate(user?.joinedAt)}</span>
          </div>
          <div className="profile-row">
            <span className="profile-row-label">
              <User size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Total Leads soumis
            </span>
            <span className="profile-row-value">{leads.length}</span>
          </div>
          <div className="profile-row">
            <span className="profile-row-label">
              <TrendingUp size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Commission totale
            </span>
            <span className="profile-row-value commission-value">{formatCurrency(stats.totalEarned)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
