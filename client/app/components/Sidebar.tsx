import { useNavigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { fetchDashboard } from "../lib/api";

// Define proper types
type MenuItem = {
  icon: string;
  label: string;
  route: string;
  badge?: string;
};

type AITool = {
  icon: string;
  label: string;
  route: string;
  live?: boolean;
};

const menuItems: MenuItem[] = [
  { icon: "home", label: "Dashboard", route: "/student" },
  { icon: "book", label: "My Courses", route: "/student/courses", badge: "6" },
  { icon: "code", label: "Code Practice", route: "/student/practice", badge: "New" },
  { icon: "clipboard", label: "Assessments", route: "/student/assessments", badge: "2" },
  { icon: "briefcase", label: "Job Board", route: "/student/jobs", badge: "12" },
  { icon: "file", label: "My Applications", route: "/student/applications" },
  { icon: "message", label: "Messages", route: "/student/message", badge: "3" },
];

const aiTools: AITool[] = [
  { icon: "sparkles", label: "AI Mentor Zara", route: "/student/chat", live: true },
  { icon: "chart", label: "Skill Analytics", route: "/student/analytics" },
];

const icons: Record<string, JSX.Element> = {
  message: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <line x1="12" y1="10" x2="12" y2="10.01"/>
    </svg>
  ),
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  book: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  file: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  code: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  clipboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  ),
  briefcase: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  sparkles: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z"/><path d="M18 14l.5 2L20 16.5 18 17l-.5 2L17 17l-2-.5L17 16z"/>
    </svg>
  ),
  chart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  profile: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

export default function Sidebar({ user, collapsed, onToggle }: { user: any; collapsed: boolean; onToggle: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      // Fetch dashboard stats from API
      const res = await fetch("http://localhost:5000/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setDashboardStats({
          streak: data.streak || 0,
          consistency: data.consistency || 0,
          rank: data.rank || "#?",
          procredits: data.procredits || 0
        });
      } else {
        // Fallback data if API fails
        setDashboardStats({
          streak: 25,
          consistency: 85,
          rank: "#8",
          procredits: 2450
        });
      }
    } catch (err) {
      console.error("Sidebar load failed:", err);
      // Fallback data on error
      setDashboardStats({
        streak: 25,
        consistency: 85,
        rank: "#8",
        procredits: 2450
      });
    } finally {
      setLoading(false);
    }
  };

  const isActive = (route: string) => location.pathname === route;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  const handleGoToProfile = () => {
    navigate("/student/profile");
  };

  const handleLogoClick = () => {
    navigate("/student");
  };

  // Collapsed sidebar
  if (collapsed) {
    return (
      <aside className="w-[72px] bg-white border-r border-slate-200 flex flex-col flex-shrink-0 items-center py-4 gap-3 z-20 transition-all duration-300">
        <button onClick={onToggle} className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all mb-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <div onClick={handleLogoClick} className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00C2CB] to-[#0066FF] flex items-center justify-center text-white font-bold text-sm cursor-pointer shadow-md hover:shadow-lg transition-all">
          CC
        </div>

        {[...menuItems, ...aiTools].map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.route)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
              isActive(item.route) ? "bg-[#00C2CB]/10 text-[#00C2CB]" : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            }`}
            title={item.label}
          >
            {icons[item.icon]}
            {'live' in item && item.live && <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full border-2 border-white"></span>}
            {'badge' in item && item.badge && <span className="absolute -top-1 -right-1 text-[9px] bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center font-bold">{item.badge === "New" ? "N" : item.badge}</span>}
          </button>
        ))}

        <button onClick={handleGoToProfile} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all" title="Profile">
          {icons.profile}
        </button>

        <button onClick={() => setShowLogoutModal(true)} className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-all" title="Logout">
          {icons.logout}
        </button>
      </aside>
    );
  }

  // Expanded sidebar
  return (
    <aside className="w-[272px] bg-white border-r border-slate-200 flex flex-col flex-shrink-0 overflow-y-auto z-20 transition-all duration-300 relative">
      
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#F8FAFC] to-transparent pointer-events-none"></div>

      {/* Logo + Toggle */}
      <div className="px-6 pt-5 pb-2 relative flex items-center justify-between">
        <div onClick={handleLogoClick} className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00C2CB] to-[#0066FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#00C2CB]/25 group-hover:scale-105 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Career<span className="text-[#00C2CB]">Connect</span>
            </span>
          </div>
        </div>
        <button onClick={onToggle} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-all flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </div>

      {/* User Profile Card - Data from DB */}
      <div onClick={handleGoToProfile} className="px-4 pb-4 pt-2 cursor-pointer">
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-[#00C2CB]/8 to-[#0066FF]/8 rounded-full blur-md group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00C2CB] to-[#0066FF] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#00C2CB]/20">
                {(user?.avatarInitials || user?.fullName?.charAt(0) || "S").toUpperCase()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.fullName || "Student"}</p>
              <p className="text-[11px] text-slate-500">{user?.department || "B.Tech AI & DS"}</p>
            </div>
          </div>
          <div className="relative flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-xs">🔥</span>
                <span className="text-sm font-bold text-amber-600">{dashboardStats?.streak || 0}</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-0.5">Streak</p>
            </div>
            <div className="w-px h-7 bg-slate-100"></div>
            <div className="flex-1 text-center">
              <span className="text-sm font-bold text-emerald-600">{dashboardStats?.consistency || 0}%</span>
              <p className="text-[9px] text-slate-400 mt-0.5">Score</p>
            </div>
            <div className="w-px h-7 bg-slate-100"></div>
            <div className="flex-1 text-center">
              <span className="text-sm font-bold text-[#00C2CB]">{dashboardStats?.rank || "#?"}</span>
              <p className="text-[9px] text-slate-400 mt-0.5">Rank</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Platform</p>
        {menuItems.map((item) => {
          const active = isActive(item.route);
          return (
            <button key={item.label} onClick={() => navigate(item.route)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                active ? "bg-gradient-to-r from-[#00C2CB]/10 to-[#00C2CB]/5 text-[#00C2CB] font-semibold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}>
              {active && <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#00C2CB] rounded-full"></div>}
              <span className="relative z-10">{icons[item.icon]}</span>
              <span className="relative z-10 flex-1 text-left">{item.label}</span>
              {item.badge && <span className={`relative z-10 text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badge === "New" ? "bg-purple-100 text-purple-600 animate-pulse" : "bg-slate-100 text-slate-500"}`}>{item.badge}</span>}
            </button>
          );
        })}

        <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 mt-4 pt-2 border-t border-slate-100">AI Tools</p>
        {aiTools.map((item) => (
          <button key={item.label} onClick={() => navigate(item.route)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive(item.route) ? "bg-gradient-to-r from-purple-50 to-purple-100/50 text-purple-700 font-semibold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}>
            <span className="relative z-10">{icons[item.icon]}</span>
            <span className="relative z-10 flex-1 text-left">{item.label}</span>
            {item.live && (
              <span className="relative z-10 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                <span className="text-[10px] text-emerald-600 font-semibold">Live</span>
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 pt-0">
        <button 
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium py-2 rounded-xl transition-all border border-red-200"
        >
          {icons.logout}
          Logout
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-80 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Logout?</h3>
            <p className="text-sm text-slate-500 mb-5">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={handleLogout} className="flex-1 py-2 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
} 