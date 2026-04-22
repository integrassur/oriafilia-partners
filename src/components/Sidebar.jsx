import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Wallet,
  User,
  Users,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/submit', icon: PlusCircle, label: 'Soumettre un Lead' },
  { to: '/leads', icon: ClipboardList, label: 'Suivi des Leads' },
  { to: '/commissions', icon: Wallet, label: 'Commissions' },
  { to: '/profile', icon: User, label: 'Profil' },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="sidebar" id="sidebar-nav">
      <div className="sidebar-header">
        <img src="/images/logo-gold.jpg" alt="Oriaffiliate" className="sidebar-logo" />
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Menu Principal</span>
        {/* eslint-disable-next-line no-unused-vars */}
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <span className="sidebar-section-label" style={{ marginTop: '24px' }}>Administration</span>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Users />
              <span>Gestion Courtiers</span>
            </NavLink>
            <NavLink
              to="/admin/leads"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <ShieldAlert />
              <span>Gestion des Leads</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-section-label">Oriaffiliate v1.0</span>
      </div>
    </aside>
  );
}
