import { useAuth } from '../context/AuthContext';
import { LogOut, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/': 'Tableau de bord',
  '/submit': 'Soumettre un Lead',
  '/leads': 'Suivi des Leads',
  '/commissions': 'Commissions',
  '/profile': 'Mon Profil',
};

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Oriafilia Partners';

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header className="header" id="header-bar">
      <div className="header-left">
        <h1>{title}</h1>
      </div>

      <div className="header-right">
        <button className="header-logout" title="Notifications" style={{ position: 'relative' }}>
          <Bell size={18} />
        </button>

        <div className="header-user" id="header-user-menu">
          <div className="header-avatar">{initials}</div>
          <span className="header-user-name">{user?.name}</span>
        </div>

        <button className="header-logout" onClick={logout} id="logout-btn" title="Déconnexion">
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
