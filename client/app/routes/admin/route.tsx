import { useState } from "react";
import { useNavigate } from "react-router";

const stats = [
  { label: "Total Users", value: "3,240", change: "+142 this week", icon: "👥", color: "#6c47ff" },
  { label: "Active Jobs", value: "156", change: "+12 today", icon: "💼", color: "#3b82f6" },
  { label: "Assessments Taken", value: "2,847", change: "+48 today", icon: "📝", color: "#f59e0b" },
  { label: "Platform Revenue", value: "₹1,24,000", change: "+8% vs last month", icon: "💰", color: "#10b981" },
];

const allUsers = [
  { name: "Bhuvaneshwaran G", email: "bhuvanesh@student.com", role: "Student", college: "AMSCE Chennai", status: "Active", date: "Apr 10" },
  { name: "TechCorp HR", email: "hr@techcorp.com", role: "Employer", college: "—", status: "Active", date: "Apr 5" },
  { name: "AMSCE Placement", email: "tpo@amsce.edu", role: "College", college: "AMSCE Chennai", status: "Active", date: "Mar 28" },
  { name: "Priya Sharma", email: "priya@iitm.ac.in", role: "Student", college: "IIT Madras", status: "Active", date: "Apr 12" },
  { name: "DataFlow HR", email: "careers@dataflow.com", role: "Employer", college: "—", status: "Suspended", date: "Apr 1" },
  { name: "Rahul Kumar", email: "rahul@nit.edu", role: "Student", college: "NIT Trichy", status: "Active", date: "Apr 8" },
  { name: "VIT Placement", email: "tpo@vit.ac.in", role: "College", college: "VIT Vellore", status: "Active", date: "Mar 15" },
  { name: "Ananya Patel", email: "ananya@bits.edu", role: "Student", college: "BITS Pilani", status: "Active", date: "Apr 9" },
];

const roleColor = (role: string) => {
  switch (role) {
    case "Student": return "bg-blue-100 text-blue-700";
    case "Employer": return "bg-purple-100 text-purple-700";
    case "College": return "bg-amber-100 text-amber-700";
    case "Admin": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-600";
  }
};

const recentActivities = [
  { action: "New job posted", detail: "TechCorp posted 'React Developer'", time: "2 min ago", icon: "📝" },
  { action: "Assessment completed", detail: "Bhuvaneshwaran G scored 24/30 in JavaScript", time: "15 min ago", icon: "📊" },
  { action: "New user registered", detail: "Priya Sharma joined as Student", time: "1 hour ago", icon: "👤" },
  { action: "Job application", detail: "15 applications for 'Python Intern' at DataFlow", time: "2 hours ago", icon: "📋" },
  { action: "Platform alert", detail: "Server load exceeded 80% for 5 minutes", time: "3 hours ago", icon: "⚠️" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f6fa]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
      `}</style>

      {/* Sidebar */}
      <aside className="w-[250px] bg-[#0D1B40] flex flex-col flex-shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">A</div>
            <div>
              <span className="text-white text-sm font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>Admin Panel</span>
              <p className="text-[10px] text-[#8899BB]">Super Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="px-3 text-[9px] font-semibold text-[#8899BB] uppercase tracking-widest mb-2">Management</p>
          {[
            { icon: "📊", label: "Overview", route: "overview" },
            { icon: "👥", label: "Users", route: "users" },
            { icon: "💼", label: "Job Listings", route: "jobs" },
            { icon: "📝", label: "Assessments", route: "assessments" },
            { icon: "🏫", label: "Colleges", route: "colleges" },
            { icon: "🏢", label: "Companies", route: "companies" },
            { icon: "📈", label: "Analytics", route: "analytics" },
            { icon: "⚙️", label: "Settings", route: "settings" },
          ].map((item) => (
            <button key={item.route} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[#8899BB] hover:bg-white/5 hover:text-white transition-all">
              <span className="text-lg">{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-[#8899BB] text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            All Systems Operational
          </div>
          <button onClick={() => { localStorage.clear(); navigate("/auth"); }} className="text-[#8899BB] text-sm hover:text-white transition-colors mt-3">🚪 Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-[#e5e7eb] px-8 py-5 sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1f3c]" style={{ fontFamily: "'Syne', sans-serif" }}>Platform Overview</h1>
            <p className="text-sm text-[#6b7280] mt-1">April 2026 • Real-time monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            <select className="px-4 py-2 border border-[#e5e7eb] rounded-xl text-sm outline-none">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Today</option>
            </select>
            <button className="px-5 py-2.5 bg-[#6c47ff] text-white text-sm font-bold rounded-xl hover:bg-[#5a3de0] transition-all shadow-md">📊 Export Report</button>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-sm hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3 shadow-md" style={{ background: `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
                <p className="text-3xl font-bold text-[#1a1f3c]" style={{ fontFamily: "'Syne', sans-serif" }}>{stat.value}</p>
                <p className="text-sm text-[#6b7280]">{stat.label}</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-1">{stat.change}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#e5e7eb]">
                <h2 className="text-lg font-bold text-[#1a1f3c]" style={{ fontFamily: "'Syne', sans-serif" }}>🕐 Recent Activity</h2>
              </div>
              <div className="divide-y divide-[#f3f4f6]">
                {recentActivities.map((act, i) => (
                  <div key={i} className="px-6 py-3.5 hover:bg-gray-50 transition-all flex items-start gap-3">
                    <span className="text-lg mt-0.5">{act.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-[#1a1f3c]">{act.action}</p>
                      <p className="text-xs text-[#6b7280]">{act.detail}</p>
                      <p className="text-[10px] text-[#9ca3af] mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Growth Chart */}
            <div className="col-span-2 bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6">
              <h2 className="text-lg font-bold text-[#1a1f3c] mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>📈 User Growth — Last 30 Days</h2>
              <div className="flex items-end gap-1 h-48">
                {[20,25,30,28,35,40,38,45,50,48,55,60,58,65,70,68,75,80,78,85,90,88,95,100,98,105,110,108,115,120].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-md transition-all hover:opacity-80" style={{ height: `${h}%`, background: "linear-gradient(180deg, #6c47ff, #3b82f6)" }}></div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-[#6b7280]">
                <span>Apr 1</span><span>Apr 15</span><span>Apr 30</span>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#6c47ff]"></span><span className="text-xs text-[#6b7280]">Students</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#3b82f6]"></span><span className="text-xs text-[#6b7280]">Employers</span></div>
              </div>
            </div>
          </div>

          {/* User Management */}
          <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1a1f3c]" style={{ fontFamily: "'Syne', sans-serif" }}>👥 User Management</h2>
              <div className="flex items-center gap-3">
                <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="px-4 py-2 border border-[#e5e7eb] rounded-xl text-sm outline-none focus:border-[#6c47ff]" />
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-[#e5e7eb] rounded-xl text-sm outline-none">
                  <option>All</option><option>Student</option><option>Employer</option><option>College</option><option>Admin</option>
                </select>
                <button className="px-4 py-2 bg-[#6c47ff] text-white text-sm font-semibold rounded-xl hover:bg-[#5a3de0] transition-all">+ Add User</button>
              </div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">#</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">Role</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">College/Company</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">Joined</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f4f6]">
                {filteredUsers.map((u, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-all">
                    <td className="px-6 py-3.5 text-sm text-[#6b7280]">{i + 1}</td>
                    <td className="px-6 py-3.5 text-sm font-semibold text-[#1a1f3c]">{u.name}</td>
                    <td className="px-6 py-3.5 text-sm text-[#6b7280]">{u.email}</td>
                    <td className="px-6 py-3.5"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${roleColor(u.role)}`}>{u.role}</span></td>
                    <td className="px-6 py-3.5 text-sm text-[#6b7280]">{u.college}</td>
                    <td className="px-6 py-3.5">
                      <button className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${u.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{u.status}</button>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-[#6b7280]">{u.date}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex gap-2">
                        <button className="text-xs text-[#6c47ff] hover:underline">Edit</button>
                        <button className="text-xs text-red-500 hover:underline">Suspend</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-3 border-t border-[#e5e7eb] flex items-center justify-between text-sm text-[#6b7280]">
              <span>Showing {filteredUsers.length} users</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded-lg border border-[#e5e7eb] hover:bg-gray-50">← Prev</button>
                <button className="px-3 py-1 rounded-lg bg-[#6c47ff] text-white">1</button>
                <button className="px-3 py-1 rounded-lg border border-[#e5e7eb] hover:bg-gray-50">2</button>
                <button className="px-3 py-1 rounded-lg border border-[#e5e7eb] hover:bg-gray-50">Next →</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}