import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AdminDashboard from './pages/AdminDashboard';
import SimulationPage from './pages/SimulationPage';
import AdminLogin from './pages/AdminLogin';
import Claims from './pages/Claims';
import Analytics from './pages/Analytics';
import Workers from './pages/Workers';
import ZoneMapPage from './pages/ZoneMapPage';
import DocsPage from './pages/DocsPage';
import { LanguageProvider } from './context/LanguageContext';


// ─── Protected route ───────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('ridershield_admin_token');
    if (!token) { setIsValid(false); return; }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${API_URL}/auth/admin/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.ok) setIsValid(true);
        else {
          localStorage.removeItem('ridershield_admin_token');
          localStorage.removeItem('ridershield_admin');
          setIsValid(false);
        }
      })
      .catch(() => setIsValid(false));
  }, []);

  if (isValid === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.15s]" />
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.3s]" />
          </div>
          <p className="text-zinc-500 text-xs font-mono tracking-wider uppercase">Verifying Session</p>
        </div>
      </div>
    );
  }

  if (isValid === false) return <Navigate to="/login" replace />;
  return children;
};

// ─── Admin shell — Sidebar only shown on authenticated pages ───────────────────
function AppShell() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isDocsPage  = location.pathname === '/docs';

  // DocsPage manages its own internal 3-column scroll — don't use overflow-y-auto on it
  const contentCls = isDocsPage
    ? 'flex-1 flex flex-col relative h-screen overflow-hidden'
    : 'flex-1 flex flex-col relative min-h-screen overflow-y-auto overflow-x-hidden';

  return (
    <div className="flex h-screen bg-[#0a0a0a] font-sans overflow-hidden">
      {!isLoginPage && <Sidebar />}
      
      <div className={contentCls}>
        <Routes>
        {/* Root → redirect to login */}
        <Route path="/"       element={<Navigate to="/login" replace />} />
        <Route path="/login"  element={<AdminLogin />} />

        {/* Protected admin routes */}
        <Route path="/dashboard"  element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/simulation" element={<ProtectedRoute><SimulationPage /></ProtectedRoute>} />
        <Route path="/claims"     element={<ProtectedRoute><Claims /></ProtectedRoute>} />
        <Route path="/analytics"  element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/workers"    element={<ProtectedRoute><Workers /></ProtectedRoute>} />
        <Route path="/zones"      element={<ProtectedRoute><ZoneMapPage /></ProtectedRoute>} />
        <Route path="/docs"       element={<ProtectedRoute><DocsPage /></ProtectedRoute>} />

        {/* Legacy paths → redirect */}
        <Route path="/admin"       element={<Navigate to="/dashboard" replace />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <AppShell />
      </Router>
    </LanguageProvider>
  );
}
