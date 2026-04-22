import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, logout } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.status === 'inactive') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div style={{ background: 'var(--color-bg-card)', padding: '40px', borderRadius: '16px', maxWidth: '400px', textAlign: 'center', border: '1px solid var(--color-border)' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 16px', color: '#ef4444' }} />
          <h2 style={{ marginBottom: '12px' }}>Compte suspendu</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            Votre accès à Oriaffiliate a été temporairement suspendu par un administrateur. Veuillez contacter le support.
          </p>
          <button className="btn btn-secondary" onClick={() => logout()}>Se déconnecter</button>
        </div>
      </div>
    );
  }
  
  return children;
}
