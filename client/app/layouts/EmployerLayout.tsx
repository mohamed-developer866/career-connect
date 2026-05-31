import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";

export default function EmployerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(function() {
    var token = localStorage.getItem("token");
    var userStr = localStorage.getItem("user");
    if (!token || !userStr) { navigate("/auth", { replace: true }); return; }
    try {
      var u = JSON.parse(userStr);
      if (!["EMPLOYER", "COLLEGE", "ADMIN"].includes(u.role)) { navigate("/auth", { replace: true }); return; }
      setUser(u);
    } catch { navigate("/auth", { replace: true }); }
  }, [navigate]);

  var isActive = function(path: string) { 
    if (path === "/employer") return location.pathname === "/employer";
    if (path === "/employer/jobs") return location.pathname === "/employer/jobs";
    if (path === "/employer/jobs/new") return location.pathname === "/employer/jobs/new";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  var navItems = [
    { icon: "📊", label: "Dashboard", path: "/employer", color: "#3b82f6" },
    { icon: "🏆", label: "College Rankings", path: "/employer/rankings", color: "#f59e0b" },
    { icon: "📝", label: "Post New Job", path: "/employer/jobs/new", color: "#10b981" },
    { icon: "📋", label: "My Jobs", path: "/employer/jobs", color: "#8b5cf6" },
    { icon: "👥", label: "Applicants", path: "/employer/applicants", color: "#ec4899" },
    { icon: "💬", label: "Messages", path: "/employer/messages", color: "#06b6d4" },
     { icon: "📄", label: "Resume", path: "/employer/employerapplications", color: "#ec4899" },
    { icon: "📈", label: "Analytics", path: "/employer/analytics", color: "#f97316" },
  ];

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-white to-indigo-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.2); }
          50% { box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        
        .nav-item {
          animation: slideIn 0.3s ease both;
          transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          position: relative;
        }
        
        .nav-item:hover {
          transform: translateX(4px);
        }
        
        .nav-item:hover .nav-icon {
          animation: float 0.3s ease;
        }
        
        .active-nav {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border-left: 3px solid #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }
        
        .active-nav .nav-icon {
          transform: scale(1.05);
        }
        
        .glow-effect {
          animation: glowPulse 2s infinite;
        }
        
        .collapse-btn {
          transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
        
        .collapse-btn:hover {
          transform: scale(1.05);
          background: #f1f5f9;
        }
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
      `}</style>

      {/* PREMIUM LIGHT SIDEBAR */}
      <div className="bg-white border-r border-slate-200 flex flex-col transition-all duration-300 flex-shrink-0 shadow-xl z-20" 
        style={{ width: collapsed ? 72 : 280 }}>
        
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-400/30 to-transparent"></div>

        {/* PREMIUM LOGO */}
        <div className="p-5 border-b border-slate-100 cursor-pointer group relative overflow-hidden" onClick={() => navigate("/employer")}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg shadow-blue-200 group-hover:shadow-blue-300 group-hover:scale-105 transition-all duration-300">
                <span className="relative z-10">🏢</span>
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            </div>
            
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <h1 className="text-sm font-bold text-slate-800 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                  CareerConnect
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-semibold text-blue-600 uppercase tracking-wide">Employer Hub</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 glow-effect"></span>
                </div>
              </div>
            )}
          </div>
          
          <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-5 space-y-1 overflow-y-auto px-3">
          <div className="flex items-center gap-2 px-3 mb-4">
            <span className="w-1 h-4 rounded-full bg-blue-500"></span>
            <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">{!collapsed && "MAIN MENU"}</p>
          </div>
          
          {navItems.map((item) => {
            const active = isActive(item.path);
            
            return (
              <button 
                key={item.path} 
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  active 
                    ? "active-nav text-blue-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="relative">
                  <span className={`text-lg nav-icon transition-all duration-300 ${active ? 'scale-110' : ''}`}>{item.icon}</span>
                  {active && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-md opacity-20"></div>
                  )}
                </div>
                
                {!collapsed && (
                  <span className="flex-1 text-left text-sm">{item.label}</span>
                )}
                
                {active && !collapsed && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 glow-effect"></div>
                )}
                
                {/* Tooltip for collapsed mode */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Pro Plan Card */}
        {!collapsed && (
          <div className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">💎</span>
                <span className="text-[10px] font-semibold text-blue-700">Pro Plan Active</span>
              </div>
              <span className="text-[8px] text-blue-400">2025-26</span>
            </div>
            <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: "75%" }}></div>
            </div>
            <p className="text-[8px] text-slate-500 mt-1.5">75% of hiring quota used</p>
          </div>
        )}

        {/* Collapse Button and User Profile */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {user?.company ? user.company.charAt(0).toUpperCase() : "E"}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-700 truncate">{user?.company || user?.fullName || "Employer"}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email?.split('@')[0] || "employer"}@company.com</p>
                  </div>
                </div>
              </div>
            )}
            
            {collapsed && (
              <div className="w-full flex justify-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {user?.company ? user.company.charAt(0).toUpperCase() : "E"}
                </div>
              </div>
            )}
            
            <button 
              onClick={() => setCollapsed(!collapsed)} 
              className="collapse-btn w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 text-xs transition-all duration-300"
            >
              {collapsed ? "→" : "←"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area with Premium Light Background */}
      <main className="flex-1 overflow-y-auto relative bg-gradient-to-br from-slate-50 via-white to-indigo-50/50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/20 to-indigo-100/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-100/20 to-pink-100/20 rounded-full blur-3xl"></div>
        </div>
        
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}