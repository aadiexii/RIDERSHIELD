import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Settings2, 
  FileText, 
  BarChart2, 
  Users, 
  Map, 
  FileCode2, 
  LogOut,
  Terminal,
  RefreshCcw,
  BugPlay,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

const ROLE_DOT = {
  superadmin:  'bg-orange-500',
  zonemanager: 'bg-blue-500',
  analyst:     'bg-green-500',
};

const NAV_GROUPS = [
  {
    label: 'Operations',
    items: [
      { id: 'dashboard', label: 'Control Center', icon: LayoutDashboard, to: '/dashboard' },
      { id: 'simulation', label: 'Simulation Studio', icon: Settings2, to: '/simulation' },
    ]
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'claims', label: 'Claims Engine', icon: FileText, to: '/claims' },
      { id: 'analytics', label: 'Analytics', icon: BarChart2, to: '/analytics' },
      { id: 'zones', label: 'Zone Map', icon: Map, to: '/zones' },
    ]
  },
  {
    label: 'Platform',
    items: [
      { id: 'workers', label: 'Workers', icon: Users, to: '/workers' },
      { id: 'docs', label: 'Documentation', icon: FileCode2, to: '/docs' },
    ]
  }
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [showDevTab, setShowDevTab] = useState(false);
  const [lastCron, setLastCron] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ridershield_admin');
      if (stored) setAdmin(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ridershield_admin_token');
    localStorage.removeItem('ridershield_admin');
    navigate('/login');
  };

  const handleCron = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await fetch(`${API_URL}/cron/run`, { method: 'POST' });
      setLastCron(Date.now());
    } catch { /* ignore */ }
  };

  if (!admin) return null;

  return (
    <aside 
      className={`bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}
      style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
    >
      {/* Brand Header */}
      <div className={`h-20 flex items-center shrink-0 border-b border-[#1a1a1a] ${collapsed ? 'justify-center px-0' : 'px-6 justify-between'}`}>
        {!collapsed ? (
          <>
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                <span className="text-orange-500 font-bold text-lg">R</span>
              </div>
              <div>
                <div className="flex items-center leading-none">
                  <span className="text-white font-bold text-base tracking-tight">RIDER</span>
                  <span className="text-orange-500 font-bold text-base tracking-tight">SHIELD</span>
                </div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">Admin Console</p>
              </div>
            </Link>
            <button 
              onClick={() => setCollapsed(true)} 
              className="p-1.5 rounded-lg text-zinc-500 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button 
            onClick={() => setCollapsed(false)}
            className="group/header w-full h-full flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer"
            title="Expand Sidebar"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center relative">
              {/* Default "RS" Logo State */}
              <div className="absolute inset-0 flex items-center justify-center bg-orange-500/10 border border-orange-500/20 rounded-xl group-hover/header:opacity-0 transition-opacity duration-200">
                <span className="text-orange-500 font-bold text-[14px] tracking-tighter">RS</span>
              </div>
              {/* Hover Toggle Icon State */}
              <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a] border border-[#333] rounded-xl opacity-0 group-hover/header:opacity-100 text-zinc-400 group-hover/header:text-white transition-opacity duration-200">
                <PanelLeftOpen className="w-5 h-5" strokeWidth={1.5} />
              </div>
            </div>
          </button>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto py-6 space-y-8 ${collapsed ? 'px-3' : 'px-4'}`}>
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-2 text-[10px] uppercase tracking-widest text-zinc-600 mb-3 font-semibold">
                {group.label}
              </p>
            )}
            <div className={`space-y-1 ${collapsed ? 'space-y-3' : ''}`}>
              {group.items.map(item => {
                const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center rounded-xl transition-all duration-200 group ${
                      collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
                    } ${
                      isActive 
                        ? 'bg-white/10 text-white font-medium' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${collapsed ? '' : 'w-4 h-4'} ${isActive ? 'text-orange-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                    {!collapsed && <span className="text-sm">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Dev Tools Drawer (Collapsible) */}
      {!collapsed && (
        <div className="px-4 pb-2 shrink-0">
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showDevTab ? 'mb-2 opacity-100 max-h-40' : 'max-h-0 opacity-0'}`}>
             <div className="bg-[#111] border border-[#222] rounded-xl p-3 flex flex-col gap-2">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">Dev Tools</span>
                  <span className="text-[9px] font-mono text-zinc-600 flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${lastCron && (Date.now() - lastCron < 15*60000) ? 'bg-green-500' : 'bg-red-500'}`} />
                    CRON
                  </span>
               </div>
               <div className="flex items-center gap-2">
                 <button onClick={handleCron} className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-[11px] py-1.5 rounded-lg border border-white/5 transition-colors">
                    <RefreshCcw className="w-3 h-3" /> Execute
                 </button>
                 <button onClick={() => window.location.reload()} className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 text-[11px] py-1.5 rounded-lg border border-orange-500/20 transition-colors">
                    <BugPlay className="w-3 h-3" /> Reset
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* User Profile Bar */}
      <div className={`shrink-0 ${collapsed ? 'px-3 pb-4' : 'px-4 pb-4'}`}>
        <div className={`bg-[#111] border border-[#222] rounded-xl flex ${collapsed ? 'flex-col items-center gap-4 py-3' : 'p-3 items-center justify-between'}`}>
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#222] border border-[#333] flex items-center justify-center text-zinc-300 text-xs font-bold uppercase" title={collapsed ? admin.name : undefined}>
              {admin.name.substring(0,2)}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-[#111] rounded-full ${ROLE_DOT[admin.role] || 'bg-zinc-500'}`} />
          </div>
          
          {!collapsed && (
            <div className="min-w-0 flex-1 ml-3 hidden md:block">
              <p className="text-sm font-medium text-white truncate leading-tight">{admin.name}</p>
              <p className="text-[10px] text-zinc-500 capitalize leading-tight mt-0.5">{admin.role}</p>
            </div>
          )}
          
          <div className={`flex flex-shrink-0 ${collapsed ? 'flex-col gap-2' : 'gap-1'}`}>
            <button 
              onClick={() => {
                if (collapsed) setCollapsed(false);
                setShowDevTab(!showDevTab);
              }}
              className={`p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer ${showDevTab && !collapsed ? 'bg-white/10 text-white' : ''}`}
              title="Toggle Dev Panel"
            >
              <Terminal className="w-4 h-4" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
