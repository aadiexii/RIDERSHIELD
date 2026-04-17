import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import LandingPage from './pages/LandingPage';
import DocsPage from './pages/DocsPage';
import WorkerDashboard from './pages/WorkerDashboard';
import SponsorPage from './pages/SponsorPage';
import AIBot from './components/AIBot';

// ─── AppShell ─────────────────────────────────────────────────────────────────
function AppShell() {
  const { pathname } = useLocation();

  // DocsPage is self-contained (manages sticky sidebar layout with no extra offset).
  // LandingPage is full-screen (no navbar offset needed).
  // All other inner pages need pt-16 to clear the sticky InnerNavbar.
  const needsPadding = pathname !== '/' && pathname !== '/docs';

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans">
      <Navbar />
      <div className={needsPadding ? 'pt-16' : ''}>
        <Routes>
          <Route path="/"          element={<LandingPage />}     />
          <Route path="/docs"      element={<DocsPage />}        />
          <Route path="/worker"    element={<WorkerDashboard />} />
          <Route path="/sponsor"   element={<SponsorPage />}     />
          {/* /insurance legacy redirect */}
          <Route path="/insurance" element={<Navigate to="/docs" replace />} />
          {/* Catch-all */}
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <AIBot />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}
