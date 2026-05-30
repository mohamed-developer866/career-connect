import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function CollegeStudents() {
  var navigate = useNavigate();
  var [students, setStudents] = useState<any[]>([]);
  var [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  var [stats, setStats] = useState({ totalStudents: 0, totalPlaced: 0, totalActive: 0, avgCredits: 0 });
  var [search, setSearch] = useState("");
  var [loading, setLoading] = useState(true);
  var [sortBy, setSortBy] = useState("credits");
  var [filterDept, setFilterDept] = useState("All");
  var [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(function() { loadStudents(); }, []);

  useEffect(function() {
    var filtered = students.filter(function(s) {
      var matchSearch = s.fullName?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase());
      var matchDept = filterDept === "All" || s.department === filterDept;
      return matchSearch && matchDept;
    });
    if (sortBy === "credits") filtered.sort(function(a, b) { return (b.procredits || 0) - (a.procredits || 0); });
    else if (sortBy === "name") filtered.sort(function(a, b) { return (a.fullName || "").localeCompare(b.fullName || ""); });
    else if (sortBy === "newest") filtered.sort(function(a, b) { return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); });
    setFilteredStudents(filtered);
  }, [search, sortBy, filterDept, students]);

  var loadStudents = async function() {
    var token = localStorage.getItem("token");
    var headers = { Authorization: "Bearer " + token };
    try {
      var res = await fetch("http://localhost:5000/api/college/public-test", { headers });
      if (res.ok) {
        var data = await res.json();
        setStudents(data.students || []);
        setFilteredStudents(data.students || []);
        setStats(data.stats || { totalStudents: 0, totalPlaced: 0, totalActive: 0, avgCredits: 0 });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  var departments = ["All"];
  students.forEach(function(s) { if (s.department && !departments.includes(s.department)) departments.push(s.department); });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 animate-spin" style={{animationDuration: '2s'}}></div>
            <div className="absolute inset-1 rounded-2xl bg-white flex items-center justify-center">
              <span className="text-3xl">🎓</span>
            </div>
          </div>
          <p className="text-violet-600 text-lg font-bold animate-pulse">Loading Students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        @keyframes floatIn { 0% { opacity: 0; transform: translateY(30px) scale(0.95); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes slideDown { 0% { opacity: 0; max-height: 0; transform: translateY(-10px); } 100% { opacity: 1; max-height: 800px; transform: translateY(0); } }
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.4); } 50% { box-shadow: 0 0 0 15px rgba(139,92,246,0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes bounceIn { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.05); } 70% { transform: scale(0.95); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes gradientShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        
        .float-in { animation: floatIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .bounce-in { animation: bounceIn 0.6s ease both; }
        .expand-card { animation: slideDown 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); overflow: hidden; }
        .shimmer-bg { background: linear-gradient(90deg, #f0f0ff 25%, #e8e4ff 50%, #f0f0ff 75%); background-size: 200% 100%; animation: shimmer 3s infinite; }
        .premium-card { transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
        .premium-card:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(108,71,255,0.15); border-color: #7c3aed; }
        .premium-card:active { transform: scale(0.98); }
        .chip-active { animation: pulseGlow 2s infinite; }
        .gradient-text { background: linear-gradient(135deg, #7c3aed, #a855f7, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-size: 200% 200%; animation: gradientShift 3s ease infinite; }
        .stat-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .stat-hover:hover { transform: translateY(-6px) scale(1.02); }
        .stat-hover:hover .stat-icon-wrap { transform: scale(1.2) rotate(-10deg); }
        .stat-icon-wrap { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* HEADER */}
        <div className="mb-10 float-in" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-purple-300 chip-active">
                  <span className="text-2xl">🎓</span>
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-400 border-3 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-lg bounce-in">
                  {stats.totalStudents}
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                  <span className="gradient-text">Student Directory</span>
                </h1>
                <p className="text-gray-500 text-sm mt-1 font-medium">
                  {stats.totalStudents} enrolled • {stats.totalPlaced} placed • {stats.totalActive} learning
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-600 font-bold text-sm">⭐</span>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stats.avgCredits}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Avg Credits</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            { label: "Total Students", value: stats.totalStudents, icon: "👥", gradient: "from-violet-500 to-purple-500", bg: "bg-violet-50", delay: "0.1s" },
            { label: "Placed", value: stats.totalPlaced, icon: "💼", gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50", delay: "0.2s" },
            { label: "Active Learning", value: stats.totalActive, icon: "📚", gradient: "from-amber-500 to-orange-500", bg: "bg-amber-50", delay: "0.3s" },
            { label: "Avg Credits", value: stats.avgCredits, icon: "🏆", gradient: "from-sky-500 to-blue-500", bg: "bg-sky-50", delay: "0.4s" }
          ].map(function(s) {
            return (
              <div key={s.label} className={"stat-hover float-in rounded-2xl p-6 border border-gray-100 shadow-sm cursor-default relative overflow-hidden " + s.bg} style={{animationDelay: s.delay}}>
                <div className={"absolute top-0 left-0 w-full h-1 bg-gradient-to-r " + s.gradient}></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="stat-icon-wrap w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md text-2xl">{s.icon}</div>
                </div>
                <p className="text-4xl font-extrabold text-gray-900 mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8 float-in" style={{animationDelay: '0.5s'}}>
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input value={search} onChange={function(e) { setSearch(e.target.value); }}
              placeholder="Search by name or email..."
              className="w-full pl-14 pr-5 py-4 rounded-2xl border-2 border-gray-200 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all bg-white text-gray-900 placeholder-gray-400 shadow-sm" />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {departments.map(function(dept) {
              return (
                <button key={dept} onClick={function() { setFilterDept(dept); }}
                  className={"px-5 py-3 rounded-2xl text-xs font-bold transition-all duration-300 " + 
                    (filterDept === dept ? "bg-violet-500 text-white shadow-xl shadow-violet-200 scale-105 chip-active" : "bg-white text-gray-600 border-2 border-gray-200 hover:border-violet-300 hover:bg-violet-50")}>
                  {dept === "All" ? "🏛️ All" : dept}
                </button>
              );
            })}
          </div>

          <select value={sortBy} onChange={function(e) { setSortBy(e.target.value); }}
            className="px-5 py-4 rounded-2xl border-2 border-gray-200 text-sm outline-none cursor-pointer bg-white text-gray-900 font-bold shadow-sm hover:border-violet-300 transition-all">
            <option value="credits">🏆 Highest Credits</option>
            <option value="name">📋 Name A-Z</option>
            <option value="newest">🆕 Newest First</option>
          </select>
        </div>

        {/* COUNT BAR */}
        <div className="flex items-center justify-between mb-6 float-in" style={{animationDelay: '0.6s'}}>
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-900 text-lg">{filteredStudents.length}</span> of <span className="font-bold text-gray-900">{students.length}</span> students
            </p>
            {filterDept !== "All" && (
              <span className="text-xs bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-bold">{filterDept}</span>
            )}
          </div>
          {search && (
            <button onClick={function() { setSearch(""); }} className="text-xs text-violet-600 hover:text-violet-800 font-bold bg-violet-50 px-4 py-2 rounded-full transition-all hover:bg-violet-100">
              Clear ✕
            </button>
          )}
        </div>

        {/* STUDENTS LIST */}
        <div className="space-y-4">
          {filteredStudents.map(function(student, index) {
            var isExpanded = expandedId === student.id;
            return (
              <div key={student.id} className="float-in" style={{animationDelay: (0.1 + index * 0.04) + 's'}}>
                
                {/* MAIN ROW */}
                <div onClick={function() { setExpandedId(isExpanded ? null : student.id); }}
                  className={"premium-card bg-white border-2 p-5 cursor-pointer flex items-center gap-4 " + 
                    (isExpanded ? "border-violet-400 rounded-t-2xl border-b-0 shadow-xl shadow-violet-100" : "border-gray-100 rounded-2xl shadow-sm hover:border-violet-200")}>
                  
                  {/* Rank Badge */}
                  <div className="w-10 text-center flex-shrink-0">
                    {index < 3 ? (
                      <span className="text-2xl" title={["Gold","Silver","Bronze"][index]}>
                        {["🥇","🥈","🥉"][index]}
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-gray-300">#{index + 1}</span>
                    )}
                  </div>

                  {/* Avatar with gradient ring */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 blur-sm opacity-40"></div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg relative">
                      {student.fullName?.charAt(0) || "S"}
                    </div>
                    {student.placementStatus === 'Placed' && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center text-[9px] shadow">✓</div>
                    )}
                  </div>

                  {/* Name & Email */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-gray-900">{student.fullName || "Unknown"}</h3>
                      {student.placementStatus === 'Placed' && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">PLACED</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate font-medium">{student.email}</p>
                  </div>

                  {/* Department Badge */}
                  <div className="hidden lg:block flex-shrink-0">
                    <span className="text-xs bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold border border-gray-200">
                      {student.department || "General"}
                    </span>
                  </div>

                  {/* Mini Stats */}
                  <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-base font-extrabold text-violet-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{student.procredits || 0}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Credits</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="text-center">
                      <p className="text-base font-extrabold text-emerald-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{(student.skills || []).length}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Skills</p>
                    </div>
                  </div>

                  {/* Message Button */}
                  <button onClick={function(e) { e.stopPropagation(); navigate("/college/messages/" + student.id); }}
                    className="w-10 h-10 rounded-xl bg-violet-50 hover:bg-violet-100 flex items-center justify-center flex-shrink-0 transition-all border-2 border-violet-200 hover:border-violet-400 hover:scale-110"
                    title={"Message " + student.fullName}>
                    <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>

                  {/* Expand Arrow */}
                  <div className={"flex-shrink-0 transition-transform duration-300 " + (isExpanded ? "rotate-180" : "")}>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* EXPANDED CARD */}
                {isExpanded && (
                  <div className="expand-card bg-white border-2 border-t-0 border-violet-300 rounded-b-2xl p-8 shadow-xl shadow-violet-100">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      
                      {/* Skills */}
                      <div className="bg-violet-50/50 rounded-2xl p-5 border border-violet-100">
                        <h4 className="text-sm font-extrabold text-violet-700 mb-4 flex items-center gap-2">
                          <span className="text-lg">🛠️</span> Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(student.skills || []).length > 0 ? student.skills.map(function(skill: any) {
                            return (
                              <span key={skill.id} className="px-3 py-2 rounded-xl bg-white text-violet-800 text-xs font-bold border border-violet-200 shadow-sm flex items-center gap-2 hover:scale-105 transition-transform">
                                {skill.name}
                                <span className="bg-violet-500 text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold">{skill.score}%</span>
                              </span>
                            );
                          }) : <p className="text-gray-400 text-xs">No skills added yet</p>}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100">
                        <h4 className="text-sm font-extrabold text-emerald-700 mb-4 flex items-center gap-2">
                          <span className="text-lg">📋</span> Details
                        </h4>
                        <div className="space-y-3">
                          {[
                            { label: "Status", value: student.placementStatus || "Unplaced", color: student.placementStatus === 'Placed' ? "text-emerald-700 bg-emerald-100" : "text-gray-600 bg-gray-100" },
                            { label: "Department", value: student.department || "General", color: "text-gray-700 bg-gray-50" },
                            { label: "College", value: student.college || "N/A", color: "text-gray-700 bg-gray-50" },
                            { label: "Email", value: student.email, color: "text-gray-700 bg-gray-50" }
                          ].map(function(d) {
                            return (
                              <div key={d.label} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{d.label}</span>
                                <span className={"text-xs font-extrabold px-2 py-1 rounded-lg " + d.color}>{d.value}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Credits & More */}
                      <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-100">
                        <h4 className="text-sm font-extrabold text-amber-700 mb-4 flex items-center gap-2">
                          <span className="text-lg">⭐</span> Performance
                        </h4>
                        <div className="space-y-4">
                          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                            <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-purple-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                              {student.procredits || 0}
                            </p>
                            <p className="text-xs font-bold text-gray-400 uppercase mt-1">ProCredits</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                              <p className="text-xl font-extrabold text-violet-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{(student.skills || []).length}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase">Skills</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                              <p className="text-xl font-extrabold text-emerald-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>0</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase">Applied</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* EMPTY STATE */}
        {filteredStudents.length === 0 && (
          <div className="text-center py-20 float-in">
            <div className="w-24 h-24 rounded-3xl bg-violet-100 flex items-center justify-center mx-auto mb-6 shimmer-bg">
              <span className="text-5xl">🔍</span>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>No Students Found</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">Try adjusting your search terms or department filter to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
}