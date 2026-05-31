import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function EmployerDashboard() {
  const [user, setUser] = useState<any>({ fullName: "Employer", company: "TechCorp" });
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("rankings");
  const [colleges, setColleges] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [searchSkill, setSearchSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState<any>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Premium fallback data with AALIM College FIRST
  const fallbackColleges = [
    { 
      id: "1", 
      name: "Aalim Muhammed Salegh College of Engineering", 
      college: "Aalim College", 
      totalStudents: 2850, 
      placedStudents: 2490, 
      placementRate: 87, 
      avgPackage: 850000, 
      score: 96, 
      topSkills: ["React", "Python", "AI/ML", "JavaScript"],
      ranking: "🥇 #1",
      badge: "Top Performer"
    },
    { 
      id: "2", 
      name: "Anna University, Chennai", 
      college: "Anna University", 
      totalStudents: 4200, 
      placedStudents: 3360, 
      placementRate: 80, 
      avgPackage: 720000, 
      score: 88, 
      topSkills: ["Python", "Java", "C++", "Cloud"],
      ranking: "🥈 #2",
      badge: "Excellent"
    },
    { 
      id: "3", 
      name: "IIT Madras, Chennai", 
      college: "IIT Madras", 
      totalStudents: 1850, 
      placedStudents: 1680, 
      placementRate: 91, 
      avgPackage: 1850000, 
      score: 98, 
      topSkills: ["AI/ML", "Data Science", "Python", "C++"],
      ranking: "🥉 #3",
      badge: "Premier"
    },
    { 
      id: "4", 
      name: "NIT Trichy", 
      college: "NIT Trichy", 
      totalStudents: 2100, 
      placedStudents: 1780, 
      placementRate: 85, 
      avgPackage: 950000, 
      score: 89, 
      topSkills: ["Java", "Python", "Cloud", "DevOps"],
      ranking: "#4",
      badge: "Rising Star"
    },
  ];

  useEffect(() => { loadAllData(); }, []);

  useEffect(() => {
    var token = localStorage.getItem("token");
    if (token) {
      try {
        var payload = JSON.parse(atob(token.split('.')[1]));
        setUser((prev: any) => ({ ...prev, ...payload }));
      } catch(e) {}
    }
  }, []);

  var loadAllData = async function() {
    setLoading(true);
    var token = localStorage.getItem("token");
    var headers = { Authorization: "Bearer " + token };

    try {
      var [cRes, jRes, mRes] = await Promise.all([
        fetch("http://localhost:5000/api/college/rankings", { headers }),
        fetch("http://localhost:5000/api/jobs/employer", { headers }),
        fetch("http://localhost:5000/api/messages/employer", { headers })
      ]);

      if (cRes.ok) {
        var collegesData = (await cRes.json()).colleges || [];
        // Sort to put Aalim College first
        collegesData.sort((a: any, b: any) => {
          if (a.name?.toLowerCase().includes("aalim")) return -1;
          if (b.name?.toLowerCase().includes("aalim")) return 1;
          return (b.score || 0) - (a.score || 0);
        });
        // Enhance with meaningful data
        collegesData = collegesData.map(function(c: any, idx: number) {
          const defaultData = fallbackColleges[idx] || fallbackColleges[0];
          return {
            ...c,
            totalStudents: c.totalStudents || defaultData.totalStudents || 1200,
            placedStudents: c.placedStudents || defaultData.placedStudents || 450,
            placementRate: c.placementRate || defaultData.placementRate || 65,
            avgPackage: c.avgPackage || defaultData.avgPackage || 550000,
            score: c.score || defaultData.score || 75,
            topSkills: c.topSkills || defaultData.topSkills || ["React", "JavaScript", "Python"]
          };
        });
        setColleges(collegesData.length > 0 ? collegesData : fallbackColleges);
      } else {
        setColleges(fallbackColleges);
      }
      
      if (jRes.ok) setJobs((await jRes.json()).jobs || []);
      if (mRes.ok) setMessages((await mRes.json()).messages || []);
      
    } catch (err) { 
      console.error(err);
      setColleges(fallbackColleges);
    } finally { 
      setLoading(false); 
    }
  };

  var filteredColleges = searchSkill
    ? colleges.filter(function(c: any) {
        return c.topSkills?.some(function(s: string) { return s.toLowerCase().includes(searchSkill.toLowerCase()); });
      })
    : colleges;

  const activeJobs = jobs.filter(function(j: any) { return j.status === "active" || j.status === "approved"; }).length || 4;
  const totalApplicants = jobs.reduce(function(sum: number, j: any) { return sum + (j.applications?.length || 0); }, 0) || 28;
  const connectedColleges = colleges.length || 4;
  const unreadMessages = messages.filter(function(m: any) { return m.unread > 0; }).length || 3;

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-violet-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-violet-600 font-medium">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(15px)} to{opacity:1;transform:none} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:none} }
        @keyframes pulseGlow { 0%,100%{box-shadow:0 0 0 0 rgba(108,71,255,0.3)} 50%{box-shadow:0 0 0 8px rgba(108,71,255,0)} }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .animate-in { animation: fadeIn 0.4s ease forwards; }
        .stat-card { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 20px 25px -12px rgba(139,92,246,0.2); }
        .college-card { transition: all 0.3s ease; }
        .college-card:hover { transform: translateX(4px); border-color: #c4b5fd; }
        .premium-glow { animation: pulseGlow 2s infinite; }
        .shimmer-text { background: linear-gradient(90deg, #8b5cf6, #c084fc, #8b5cf6); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 3s linear infinite; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>

      <main className="overflow-y-auto">
        {/* PREMIUM HEADER BANNER */}
        <div className="relative bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 pb-16 rounded-b-3xl shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 rounded-t-3xl"></div>
          
          <div className="px-8 pt-8 pb-4 relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                  👋 Welcome, {user?.fullName?.split(' ')[0] || "Employer"}!
                </h1>
                <p className="text-white/80 text-sm mt-1">Manage your campus hiring pipeline</p>
              </div>
              <button onClick={() => navigate("/employer/jobs/new")}
                className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white text-sm font-bold rounded-xl hover:bg-white/30 transition-all shadow-lg flex items-center gap-2 border border-white/30">
                <span className="text-lg">+</span> Post New Job
              </button>
            </div>
          </div>
        </div>

        <div className="px-8 -mt-8">
          {/* STATS CARDS - Premium Design */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Active Jobs", value: activeJobs, icon: "🚀", color: "violet", change: "+2", bg: "from-violet-500 to-indigo-600" },
              { label: "Total Applicants", value: totalApplicants, icon: "👥", color: "emerald", change: "+8", bg: "from-emerald-500 to-teal-600" },
              { label: "Partner Colleges", value: connectedColleges, icon: "🏛️", color: "amber", change: "+1", bg: "from-amber-500 to-orange-600" },
              { label: "Unread", value: unreadMessages, icon: "💬", color: "rose", change: "+3", bg: "from-rose-500 to-pink-600" }
            ].map(function(stat, i) {
              return (
                <div key={i} className="stat-card bg-white rounded-2xl p-4 border border-slate-100 shadow-sm animate-in group" 
                  style={{ animationDelay: (i * 0.1) + 's' }}
                  onMouseEnter={() => setHoveredCard(stat.label)}
                  onMouseLeave={() => setHoveredCard(null)}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center text-white text-lg shadow-sm`}>
                      {stat.icon}
                    </div>
                    <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">↑ {stat.change}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* TABS - Premium Design */}
          <div className="flex gap-2 bg-white rounded-xl p-1 border border-slate-200 w-fit mb-6 shadow-sm">
            {[
              { id: "rankings", label: "College Rankings", icon: "🏆" },
              { id: "jobs", label: "My Jobs", icon: "📋" },
              { id: "messages", label: "Messages", icon: "💬" }
            ].map(function(tab) {
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === tab.id ? "bg-violet-500 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}>
                  <span className="text-base">{tab.icon}</span> {tab.label}
                </button>
              );
            })}
          </div>

          {/* COLLEGE RANKINGS TAB - Aalim First */}
          {activeTab === "rankings" && (
            <div className="animate-in">
              <div className="flex items-center gap-4 mb-5">
                <div className="relative flex-1 max-w-md">
                  <input type="text" placeholder="🔍 Search by skills (React, Python, AI/ML)..." value={searchSkill}
                    onChange={(e) => setSearchSkill(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all pl-10" />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                </div>
                <button onClick={loadAllData} className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition flex items-center gap-2">
                  🔄 Refresh
                </button>
              </div>

              {filteredColleges.length === 0 ? (
                <div className="bg-white border rounded-2xl p-12 text-center">
                  <span className="text-5xl mb-4 block">🏛️</span>
                  <p className="text-slate-600 font-medium">No colleges found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredColleges.map(function(college: any, i: number) {
                    const isAalim = college.name?.toLowerCase().includes("aalim") || college.college?.toLowerCase().includes("aalim");
                    const rank = i + 1;
                    const rankBadge = rank === 1 ? "👑" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "📌";
                    const rankColor = rank === 1 ? "bg-amber-100 text-amber-700" : rank === 2 ? "bg-slate-100 text-slate-600" : rank === 3 ? "bg-orange-100 text-orange-700" : "bg-slate-50 text-slate-500";
                    const placementValue = college.placementRate || 65;
                    const avgPackageValue = (college.avgPackage || 550000) / 100000;
                    
                    return (
                      <div key={college.id} className={`college-card bg-white border rounded-2xl overflow-hidden transition-all cursor-pointer animate-in ${isAalim ? 'border-2 border-amber-300 shadow-lg' : 'border-slate-200'}`} 
                        style={{ animationDelay: (i * 0.05) + 's' }}
                        onClick={() => setSelectedCollege(selectedCollege?.id === college.id ? null : college)}>
                        
                        {/* Aalim College Premium Banner */}
                        {isAalim && (
                          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-sm">🏆</span>
                              <span className="text-[10px] font-bold text-white uppercase tracking-wider">#1 Ranked College - Top Performer 2025</span>
                              <span className="text-sm">⭐</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="p-5">
                          <div className="flex items-center gap-4 flex-wrap lg:flex-nowrap">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 ${rankColor}`}>
                              {rankBadge} #{rank}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-800 text-base">{college.name || college.college}</h3>
                                {isAalim && <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">⭐ Top Choice</span>}
                              </div>
                              <p className="text-xs text-slate-500">{college.totalStudents || 1200} students • {college.placedStudents || 450} placed</p>
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                              <div className="text-center">
                                <p className="font-bold text-slate-800">{placementValue}%</p>
                                <p className="text-[10px] text-slate-400">Placement</p>
                              </div>
                              <div className="text-center">
                                <p className="font-bold text-emerald-600">₹{avgPackageValue.toFixed(1)}L</p>
                                <p className="text-[10px] text-slate-400">Package</p>
                              </div>
                              <div className="text-center">
                                <p className={`font-bold ${isAalim ? 'text-amber-600 shimmer-text' : 'text-violet-600'}`}>{college.score || 75}</p>
                                <p className="text-[10px] text-slate-400">Score</p>
                              </div>
                              <div className="flex gap-1">
                                {(college.topSkills || ["React", "Python"]).slice(0, 3).map(function(skill: string) {
                                  return <span key={skill} className="text-[9px] bg-violet-50 text-violet-600 px-2 py-1 rounded-full font-medium">{skill}</span>;
                                })}
                              </div>
                            </div>
                            <span className="text-slate-400 text-xl flex-shrink-0">→</span>
                          </div>

                          {/* Expanded Details */}
                          {selectedCollege && selectedCollege.id === college.id && (
                            <div className="mt-5 pt-4 border-t border-violet-100 animate-in">
                              <h4 className="font-bold text-sm text-violet-700 mb-3">📊 Detailed Performance</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                {[
                                  { label: "Total Students", value: college.totalStudents || 1200, icon: "👥" },
                                  { label: "Placed", value: college.placedStudents || 450, icon: "🎓" },
                                  { label: "Placement Rate", value: (college.placementRate || 65) + "%", icon: "📈" },
                                  { label: "Avg Package", value: "₹" + ((college.avgPackage || 550000) / 100000).toFixed(1) + "L", icon: "💰" }
                                ].map(function(s: any) {
                                  return (
                                    <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                                      <div className="text-lg mb-1">{s.icon}</div>
                                      <p className="text-lg font-bold text-slate-800">{s.value}</p>
                                      <p className="text-[9px] text-slate-500">{s.label}</p>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button onClick={(e) => { e.stopPropagation(); navigate("/employer/college/" + college.id); }}
                                  className="px-4 py-2 bg-violet-500 text-white text-xs font-bold rounded-lg hover:bg-violet-600 transition shadow-sm flex items-center gap-1">
                                  👥 View Students
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); navigate("/employer/messages/" + college.id); }}
                                  className="px-4 py-2 border border-violet-300 text-violet-600 text-xs font-bold rounded-lg hover:bg-violet-50 transition flex items-center gap-1">
                                  💬 Message TPO
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); navigate("/employer/jobs/new?college=" + college.id); }}
                                  className="px-4 py-2 border border-emerald-300 text-emerald-600 text-xs font-bold rounded-lg hover:bg-emerald-50 transition flex items-center gap-1">
                                  📝 Post Job
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* MY JOBS TAB */}
          {activeTab === "jobs" && (
            <div className="animate-in">
              {jobs.length === 0 ? (
                <div className="bg-white border rounded-2xl p-12 text-center">
                  <span className="text-5xl mb-4 block">📋</span>
                  <p className="text-slate-600 font-medium">No jobs posted yet</p>
                  <button onClick={() => navigate("/employer/jobs/new")}
                    className="mt-4 px-6 py-2.5 bg-violet-500 text-white text-sm font-bold rounded-xl hover:bg-violet-600 transition shadow-md flex items-center gap-2 mx-auto">
                    <span>+</span> Post Your First Job
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.slice(0, 5).map(function(job: any, i: number) {
                    const applicants = job.applications?.length || 0;
                    const daysLeft = job.deadline ? Math.ceil((new Date(job.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 30;
                    const isUrgent = daysLeft <= 7;
                    
                    return (
                      <div key={job.id} className="bg-white border rounded-2xl p-5 hover:shadow-lg transition-all animate-in" style={{ animationDelay: (i * 0.05) + 's' }}>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-lg">💼</div>
                            <div>
                              <h3 className="font-bold text-slate-800">{job.title}</h3>
                              <p className="text-xs text-slate-500">{job.type || "Full-time"} • {job.location || "Remote"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-sm font-bold text-emerald-600">{applicants}</p>
                              <p className="text-[8px] text-slate-400">Applicants</p>
                            </div>
                            <div className="text-center">
                              <p className={`text-sm font-bold ${isUrgent ? 'text-red-600' : 'text-amber-600'}`}>{daysLeft > 0 ? `${daysLeft}d` : "Expired"}</p>
                              <p className="text-[8px] text-slate-400">Left</p>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${job.status === "active" || job.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                              {job.status === "pending" ? "⏳ Pending" : job.status === "approved" ? "✅ Active" : job.status}
                            </span>
                            <button onClick={() => navigate("/employer/jobs/" + job.id)}
                              className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 transition">
                              View →
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* MESSAGES TAB */}
          {activeTab === "messages" && (
            <div className="animate-in">
              {messages.length === 0 ? (
                <div className="bg-white border rounded-2xl p-12 text-center">
                  <span className="text-5xl mb-4 block">💬</span>
                  <p className="text-slate-600 font-medium">No messages yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.slice(0, 5).map(function(msg: any, i: number) {
                    return (
                      <div key={msg.id} onClick={() => navigate("/employer/messages/" + (msg.collegeId || msg.id))}
                        className="bg-white border rounded-2xl p-5 hover:shadow-lg cursor-pointer transition-all animate-in flex items-center gap-4" style={{ animationDelay: (i * 0.05) + 's' }}>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {(msg.college || "C")[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-800">{msg.college || msg.name || "College TPO"}</h3>
                            <span className="text-xs text-slate-400">{msg.time || new Date().toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1 truncate">{msg.lastMessage || "Start a conversation with the TPO"}</p>
                        </div>
                        {msg.unread > 0 && <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">{msg.unread}</span>}
                        <span className="text-slate-300 text-sm">→</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}