 import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";

export default function CollegeLayout() {
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

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f6fa]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Syne:wght@700;800&display=swap');
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:none} }
        @keyframes glow { 0%,100%{box-shadow:0 0 10px rgba(0,194,203,0.2)} 50%{box-shadow:0 0 25px rgba(0,194,203,0.5)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        .nav-item { animation: slideIn 0.3s ease both; }
        .nav-item:nth-child(1){animation-delay:0.05s}.nav-item:nth-child(2){animation-delay:0.1s}
        .nav-item:nth-child(3){animation-delay:0.15s}.nav-item:nth-child(4){animation-delay:0.2s}
        .nav-item:nth-child(5){animation-delay:0.25s}.nav-item:nth-child(6){animation-delay:0.3s}
        .nav-item:hover .nav-icon { animation: float 0.5s ease; }
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:3px}
      `}</style>

      {/* PREMIUM GREEN/TEAL SIDEBAR */}
      <div className="bg-gradient-to-b from-emerald-950 via-teal-950 to-cyan-950 text-white flex flex-col transition-all flex-shrink-0 shadow-2xl z-20" 
        style={{ width: collapsed ? 68 : 260 }}>
        
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-400/30 to-transparent"></div>

        {/* Logo */}
        
{/* PREMIUM LOGO */}
<div className="p-5 border-b border-white/5 cursor-pointer group relative overflow-hidden" onClick={function(){navigate("/college")}}>
  {/* Background glow */}
  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
  
  <div className="relative flex items-center gap-3">
    {/* Animated Logo Icon */}
    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 flex items-center justify-center text-xl shadow-xl shadow-emerald-500/30 group-hover:shadow-emerald-500/50 group-hover:scale-105 transition-all duration-300 relative">
      <span className="relative z-10">🏫</span>
      {/* Ping animation */}
      <span className="absolute inset-0 rounded-2xl bg-emerald-400 animate-ping opacity-10"></span>
    </div>
    
    {!collapsed && (
      <div className="min-w-0 flex-1">
        {/* College Name with gradient text */}
        <h1 className="text-sm font-black tracking-tight bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent truncate" 
          style={{fontFamily:"'Syne',sans-serif"}}>
          {user?.college || "AMSCE Chennai"}
        </h1>
        
        {/* TPO Badge */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[9px] text-emerald-300/80 uppercase tracking-[0.25em] font-bold">TPO Portal</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse"></span>
        </div>
        
        {/* Department */}
        {user?.department && (
          <p className="text-[9px] text-white/30 mt-0.5 truncate">{user.department}</p>
        )}
      </div>
    )}
  </div>
  
  {/* Bottom gradient line */}
  <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent"></div>
</div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto px-3">
          <p className="text-[9px] text-white/25 uppercase tracking-[0.2em] font-bold px-3 mb-3">{!collapsed && "Main Menu"}</p>
          {navItems.map(function(item, i) {
            var active = isActive(item.path);
            return (
              <button key={item.path} onClick={function(){navigate(item.path)}}
                className={"nav-item w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all " + 
                  (active ? "bg-white/15 text-white shadow-lg" : "text-white/50 hover:bg-white/5 hover:text-white")}>
                <span className="text-lg nav-icon flex-shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
                {active && !collapsed && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 glow"></span>}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xs font-bold shadow-lg">
              {user?.fullName?.charAt(0) || "T"}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{user?.fullName || "TPO"}</p>
                <p className="text-[9px] text-white/40 truncate">{user?.email || ""}</p>
              </div>
            )}
            <button onClick={function(){setCollapsed(!collapsed)}} className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white text-xs transition-all">
              {collapsed ? "▶" : "◀"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}