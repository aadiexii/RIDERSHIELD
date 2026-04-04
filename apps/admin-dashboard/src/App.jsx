import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Claims from './pages/Claims';
import Analytics from './pages/Analytics';
import WorkerDashboard from './pages/WorkerDashboard';
import DocsPage from './pages/DocsPage';
import InsurancePage from './pages/InsurancePage';
import { LanguageProvider } from './context/LanguageContext';

// ─── Protected route: redirects to login if no token ─────────────────────────
const ProtectedRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('ridershield_admin_token');
    if (!token) {
      setIsValid(false);
      return;
    }

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
      .catch((err) => {
        console.error('Session verification failed:', err);
        setIsValid(false);
      });
  }, []);

  if (isValid === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-1 items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.15s]" />
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.3s]" />
          </div>
          <p className="text-zinc-500 text-xs font-mono tracking-wider uppercase">Verifying Session</p>
        </div>
      </div>
    );
  }

  if (isValid === false) return <Navigate to="/admin/login" replace />;
  
  return children;
};

// ─── App shell with Navbar + Routes ──────────────────────────────────────────
function AppShell() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans">
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"            element={<LandingPage />}       />
        <Route path="/admin/login" element={<AdminLogin />}        />
        <Route path="/worker"      element={<WorkerDashboard />}   />
        <Route path="/docs"        element={<DocsPage />}          />
        <Route path="/insurance"   element={<InsurancePage />}     />

        {/* Protected */}
        <Route path="/admin"     element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/claims"    element={<ProtectedRoute><Claims /></ProtectedRoute>}         />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>}      />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
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
