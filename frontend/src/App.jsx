import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SnippetsListPage from './pages/SnippetsListPage';
import SnippetCreatePage from './pages/SnippetCreatePage';
import SnippetDetailPage from './pages/SnippetDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ChatPage from './pages/ChatPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#323B44' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg, #287999, #ACB9A5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" fill="#EDEFDF" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <p style={{ color: '#ACB9A5', fontSize: 13 }}>Loading...</p>
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/app/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            {/* Protected routes inside Layout */}
            <Route
              path="/app"
              element={<ProtectedRoute><Layout /></ProtectedRoute>}
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="snippets" element={<SnippetsListPage />} />
              <Route path="snippets/new" element={<SnippetCreatePage />} />
              <Route path="snippets/:id" element={<SnippetDetailPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="admin" element={<AdminDashboardPage />} />
            </Route>

            {/* Legacy redirects */}
            <Route path="/dashboard" element={<ProtectedRoute><Navigate to="/app/dashboard" replace /></ProtectedRoute>} />
            <Route path="/snippets" element={<ProtectedRoute><Navigate to="/app/snippets" replace /></ProtectedRoute>} />
            <Route path="/snippets/new" element={<ProtectedRoute><Navigate to="/app/snippets/new" replace /></ProtectedRoute>} />
            <Route path="/snippets/:id" element={<ProtectedRoute><Navigate to="/app/snippets/:id" replace /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Navigate to="/app/chat" replace /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
