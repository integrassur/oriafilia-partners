import { createContext, useContext, useState, useCallback } from 'react';
import { PARTNERS as SEED_PARTNERS } from '../utils/seedData';

const AuthContext = createContext(null);

const STORAGE_KEY = 'integra_auth';

function getStoredPartners() {
  try {
    const stored = localStorage.getItem('integra_partners');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  localStorage.setItem('integra_partners', JSON.stringify(SEED_PARTNERS));
  return SEED_PARTNERS;
}

export function AuthProvider({ children }) {
  const [partners, setPartners] = useState(getStoredPartners);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const partner = partners.find(p => p.id === parsed.id);
        if (partner) return partner;
      }
    } catch { /* ignore */ }
    return null;
  });
  const [error, setError] = useState('');

  const login = useCallback((email, password) => {
    setError('');
    const partner = partners.find(
      p => p.email.toLowerCase() === email.toLowerCase() && p.password === password
    );
    if (partner) {
      const userData = { id: partner.id, name: partner.name, email: partner.email, role: partner.role, joinedAt: partner.joinedAt };
      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      return true;
    } else {
      setError('Email ou mot de passe incorrect.');
      return false;
    }
  }, [partners]);

  const addPartner = useCallback((name, email, password) => {
    const newPartner = {
      id: `partner_${Date.now()}`,
      name,
      email,
      password,
      role: 'Partner',
      joinedAt: new Date().toISOString().split('T')[0],
    };
    const updated = [...partners, newPartner];
    setPartners(updated);
    localStorage.setItem('integra_partners', JSON.stringify(updated));
    return newPartner;
  }, [partners]);

  const updateUserRole = useCallback((userId, newRole) => {
    const updated = partners.map(p => 
      p.id === userId ? { ...p, role: newRole } : p
    );
    setPartners(updated);
    localStorage.setItem('integra_partners', JSON.stringify(updated));
  }, [partners]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, partners, login, logout, addPartner, updateUserRole, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
