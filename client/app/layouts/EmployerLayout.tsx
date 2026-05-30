import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";

export default function EmployerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);

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
    { icon: "📊", label: "Dashboard", path: "/employer", color: "#6c47ff" },
    { icon: "🏆", label: "College Rankings", path: "/employer/rankings", color: "#F59E0B" },
    { icon: "📝", label: "Post New Job", path: "/employer/jobs/new", color: "#3cc68a" },
    { icon: "📋", label: "My Jobs", path: "/employer/jobs", color: "#3B82F6" },
    { icon: "👥", label: "Applicants", path: "/employer/applicants", color: "#8B5CF6" },
    { icon: "💬", label: "Messages", path: "/employer/messages", color: "#EC4899" },
    { icon: "📈", label: "Analytics", path: "/employer/analytics", color: "#10B981" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f6fa]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Syne:wght@700;800&family=Space+Grotesk:wght@500;600;700&display=swap');
        
        @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 5px rgba(108,71,255,0.3); } 50% { box-shadow: 0 0 20px rgba(108,71,255,0.6); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-4px); } }
        
        .nav-item { animation: slideIn 0.3s ease both; }
        .nav-item:nth-child(1) { animation-delay: 0.05s; }
        .nav-item:nth-child(2) { animation-delay: 0.1s; }
        .nav-item:nth-child(3) { animation-delay: 0.15s; }
        .nav-item:nth-child(4) { animation-delay: 0.2s; }
        .nav-item:nth-child(5) { animation-delay: 0.25s; }
        .nav-item:nth-child(6) { animation-delay: 0.3s; }
        .nav-item:nth-child(7) { animation-delay: 0.35s; }
        
        .nav-item:hover .nav-icon { animation: float 0.6s ease; }
        .active-indicator { animation: glow 2s infinite; }
        
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
      `}</style>

      {/* EMPLOYER SIDEBAR */}
      <div className="bg-gradient-to-b from-[#0f1123] via-[#1a1f3c] to-[#151832] text-white flex flex-col transition-all duration-300 flex-shrink-0 relative z-20 shadow-2xl" 
        style={{ width: collapsed ? 68 : 260 }}>
        
        {/* Subtle glow line at right */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#6c47ff]/30 to-transparent"></div>

        {/* LOGO */}
                
        <div className="p-5 border-b border-white/5 cursor-pointer group" onClick={function() { navigate("/employer"); }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#6c47ff] to-[#3cc68a] flex items-center justify-center text-xl shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 group-hover:scale-105 transition-all duration-300">
              🏢
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-black tracking-tight leading-none text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <span className="text-[#a78bfa]">Career</span>Connect
                </h1>
                <p className="text-[9px] text-white/35 uppercase tracking-[0.25em] font-bold mt-0.5">Employer Hub</p>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto px-3">
          <p className="text-[9px] text-white/25 uppercase tracking-[0.2em] font-bold px-3 mb-3">
            {!collapsed && "Main Menu"}
          </p>
          {navItems.map(function(item, i) {
            var active = isActive(item.path);
            return (
              <button key={item.path} onClick={function() { navigate(item.path); }}
                className={"nav-item w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative " + 
                  (active ? "bg-[#6c47ff]/15 text-white" : "text-white/50 hover:bg-white/5 hover:text-white")}>
                
                {/* Active indicator */}
                {active && (
                  <div className="active-indicator absolute left-0 top-2 bottom-2 w-1 rounded-full" style={{ background: item.color }}></div>
                )}
                
                {/* Icon container */}
                <div className={"w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 nav-icon transition-all duration-300 " + 
                  (active ? "bg-white/10 shadow-lg" : "bg-white/5 group-hover:bg-white/10")}
                  style={active ? { boxShadow: "0 4px 15px " + item.color + "30" } : {}}>
                  {item.icon}
                </div>
                
                {/* Label */}
                {!collapsed && (
                  <span className="flex-1 text-left transition-all duration-200">{item.label}</span>
                )}
                
                {/* Active dot */}
                {active && !collapsed && (
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color, boxShadow: "0 0 8px " + item.color }}></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* BOTTOM SECTION */}
        <div className="p-4 border-t border-white/5 space-y-3">
          {/* Pro Credits */}
          {!collapsed && (
            <div className="bg-gradient-to-r from-[#6c47ff]/10 to-[#a78bfa]/10 rounded-xl p-3 border border-[#6c47ff]/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💎</span>
                <span className="text-xs font-bold text-white/80">Pro Plan Active</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#6c47ff] to-[#a78bfa] rounded-full w-3/4"></div>
              </div>
              <p className="text-[9px] text-white/40 mt-1.5">75% of hiring quota used</p>
            </div>
          )}

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6c47ff] to-[#a78bfa] flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-lg shadow-purple-500/20">
              {user?.company ? user.company.charAt(0).toUpperCase() : "E"}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate text-white/90">{user?.company || user?.fullName || "Employer"}</p>
                <p className="text-[9px] text-white/40 truncate">{user?.email || ""}</p>
              </div>
            )}
            {/* Collapse Toggle */}
            <button onClick={function(e) { e.stopPropagation(); setCollapsed(!collapsed); }}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all text-xs flex-shrink-0">
              {collapsed ? "▶" : "◀"}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto bg-[#f5f6fa]">
        <Outlet />
      </main>
    </div>
  );
}