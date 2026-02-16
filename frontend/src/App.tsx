import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './context/store';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import FileBrowserPage from './pages/FileBrowserPage';
import SourcesPage from './pages/SourcesPage';
import RulesPage from './pages/RulesPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/files" element={<FileBrowserPage />} />
                <Route path="/sources" element={<SourcesPage />} />
                <Route path="/rules" element={<RulesPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
