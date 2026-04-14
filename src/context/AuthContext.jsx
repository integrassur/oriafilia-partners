import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [partners, setPartners] = useState([]); // Utilisé pour l'écran Admin
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Récupérer la session active au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // 2. Écouter les changements de connexion (ex: déconnexion depuis un autre onglet)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (error) throw error;
      
      // On combine les infos d'auth et le profil public
      setUser({
        id: data.id,
        email: data.email,
        role: data.role, // 'admin' ou 'partner'
        name: data.email.split('@')[0], // Fallback visuel
        status: data.status,
        joinedAt: data.created_at
      });
      
      // Si l'utilisateur est admin, on charge son carnet de partenaires
      if (data.role === 'admin') {
         fetchPartners();
      }
    } catch (err) {
      console.error('Erreur du profil:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) { console.error('fetchPartners error:', error); return; }
    if (data) {
      const formatted = data.map(p => ({
        id: p.id,
        name: p.full_name || p.email.split('@')[0], // préfère full_name
        email: p.email,
        role: p.role,
        status: p.status,
        joinedAt: p.created_at
      }));
      setPartners(formatted);
    }
  };

  const login = async (email, password) => {
    setError('');
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setError('Email ou mot de passe incorrect.');
      setLoading(false);
      return false;
    }
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Ajout par l'admin via Supabase Auth
  const addPartner = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      throw new Error(error.message);
    }
    fetchPartners();
    return data;
  };

  // Mettre à jour le rôle (nécessite que l'admin ait les droits UPDATE)
  const updateUserRole = async (userId, newRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);
      
    if (!error) {
      fetchPartners();
    } else {
      console.error("Erreur de mise à jour du rôle", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, partners, login, logout, addPartner, updateUserRole, error, setError, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
