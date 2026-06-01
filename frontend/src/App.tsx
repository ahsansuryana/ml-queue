import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStreamer } from './hooks/useStreamer';
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
import DashboardPage from './pages/DashboardPage';
import WebhookPage from './pages/WebhookPage';
import PredictionPage from './pages/PredictionPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { streamer, loading } = useStreamer();
  if (loading) return <div className="flex items-center justify-center h-screen text-text-muted">Loading...</div>;
  if (!streamer) return <Navigate to="/login" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>}
        />
        <Route
          path="/webhook"
          element={<ProtectedRoute><Layout><WebhookPage /></Layout></ProtectedRoute>}
        />
        <Route
          path="/predictions"
          element={<ProtectedRoute><Layout><PredictionPage /></Layout></ProtectedRoute>}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
