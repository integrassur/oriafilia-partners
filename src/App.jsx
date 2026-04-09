import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LeadProvider } from './context/LeadContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SubmitLeadPage from './pages/SubmitLeadPage';
import TrackLeadsPage from './pages/TrackLeadsPage';
import CommissionsPage from './pages/CommissionsPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersPage from './pages/AdminUsersPage';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route element={
        <ProtectedRoute>
          <LeadProvider>
            <Layout />
          </LeadProvider>
        </ProtectedRoute>
      }>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/submit" element={<SubmitLeadPage />} />
        <Route path="/leads" element={<TrackLeadsPage />} />
        <Route path="/commissions" element={<CommissionsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
