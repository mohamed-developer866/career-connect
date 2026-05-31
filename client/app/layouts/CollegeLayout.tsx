import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";

export default function CollegeLayout() {
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
      if (u.role !== "COLLEGE") { navigate("/auth", { replace: true }); return; }
      setUser(u);
    } catch { navigate("/auth", { replace: true }); }
  }, []);

  var isActive = function(path: string) { 
    if (path === "/college") {
      return location.pathname === "/college";
    }
    return location.pathname.startsWith(path);
  };

  var navItems = [
    { icon: "📊", label: "Dashboard", path: "/college" },
    { icon: "👨‍🎓", label: "Students", path: "/college/students" },
    { icon: "🏢", label: "Companies", path: "/college/companies" },
    { icon: "💬", label: "Messages", path: "/college/messages" },
    { icon: "📢", label: "Broadcast", path: "/college/broadcast" },
    { icon: "📈", label: "Reports", path: "/college/reports" },
  ];

  // Don't render until user is loaded
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
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
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-left: 3px solid #10b981;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
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
        ::-webkit-scrollbar-thumb:hover { background: #10b981; }
      `}</style>

      {/* PREMIUM LIGHT SIDEBAR */}
      <div className="bg-white border-r border-slate-200 flex flex-col transition-all duration-300 flex-shrink-0 shadow-xl z-20" 
        style={{ width: collapsed ? 72 : 280 }}>
        
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-400/30 to-transparent"></div>

        {/* PREMIUM LOGO */}
        <div className="p-5 border-b border-slate-100 cursor-pointer group relative overflow-hidden" onClick={() => navigate("/college")}>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-200 group-hover:shadow-emerald-300 group-hover:scale-105 transition-all duration-300">
                <span className="relative z-10">🏫</span>
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            </div>
            
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <h1 className="text-sm font-bold text-slate-800 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {user?.college?.split(' ').slice(0, 2).join(' ') || "AMSCE Chennai"}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-semibold text-emerald-600 uppercase tracking-wide">TPO Portal</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 glow-effect"></span>
                </div>
              </div>
            )}
          </div>
          
          <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent"></div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-5 space-y-1 overflow-y-auto px-3">
          <div className="flex items-center gap-2 px-3 mb-4">
            <span className="w-1 h-4 rounded-full bg-emerald-500"></span>
            <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">{!collapsed && "MAIN MENU"}</p>
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
                    ? "active-nav text-emerald-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="relative">
                  <span className={`text-lg nav-icon transition-all duration-300 ${active ? 'scale-110' : ''}`}>{item.icon}</span>
                  {active && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-md opacity-20"></div>
                  )}
                </div>
                
                {!collapsed && (
                  <span className="flex-1 text-left text-sm">{item.label}</span>
                )}
                
                {active && !collapsed && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 glow-effect"></div>
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

        {/* Stats Section */}
        {!collapsed && (
          <div className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">PLACEMENT STATS</span>
              <span className="text-[9px] text-slate-400">2025-26</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-slate-600">Placement Rate</span>
                  <span className="text-emerald-600 font-semibold">87%</span>
                </div>
                <div className="h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: "87%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-slate-600">Companies Visited</span>
                  <span className="text-emerald-600 font-semibold">124</span>
                </div>
                <div className="h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: "82%" }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collapse Button and User Profile */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {user?.fullName?.charAt(0) || "T"}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-700 truncate">{user?.fullName || "TPO Officer"}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email?.split('@')[0] || "admin"}@college.edu</p>
                  </div>
                </div>
              </div>
            )}
            
            {collapsed && (
              <div className="w-full flex justify-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {user?.fullName?.charAt(0) || "T"}
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

      {/* Main Content - Pass user to outlet context */}
      <main className="flex-1 overflow-y-auto relative bg-gradient-to-br from-slate-50 via-white to-indigo-50/50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-100/20 to-teal-100/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-100/20 to-pink-100/20 rounded-full blur-3xl"></div>
        </div>
        
        {/* Pass user to outlet context */}
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}