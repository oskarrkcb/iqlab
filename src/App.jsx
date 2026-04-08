import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

const Login = lazy(() => import('./pages/Login'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Training = lazy(() => import('./pages/Training'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Profile = lazy(() => import('./pages/Profile'));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <a href="#main-content" className="skip-link">Zum Inhalt springen</a>
          <Navbar />
          <main id="main-content">
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/training" element={<Training />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </main>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
