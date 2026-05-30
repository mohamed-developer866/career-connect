import { useState, useEffect } from "react";
import { useNavigate } from "react-router";


export default function EmployerDashboard() {
  const [user, setUser] = useState<any>({ fullName: "Employer", company: "TechCorp" });
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("rankings");
  const [colleges, setColleges] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [searchSkill, setSearchSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState<any>(null);

  useEffect(function() { loadAllData(); }, []);
  useEffect(function() {
  var token = localStorage.getItem("token");
  if (token) {
    var payload = JSON.parse(atob(token.split('.')[1]));
    setUser(payload);
  }
}, []);
  var loadAllData = async function() {
    setLoading(true);
    var token = localStorage.getItem("token");
    var headers = { Authorization: "Bearer " + token };

    try {
      var [cRes, jRes, mRes, sRes] = await Promise.all([
        fetch("http://localhost:5000/api/college/rankings", { headers }),
        fetch("http://localhost:5000/api/jobs/employer", { headers }),
        fetch("http://localhost:5000/api/messages/employer", { headers }),
        fetch("http://localhost:5000/api/dashboard/stats", { headers })
      ]);

      if (cRes.ok) setColleges((await cRes.json()).colleges || []);
      if (jRes.ok) setJobs((await jRes.json()).jobs || []);
      if (mRes.ok) setMessages((await mRes.json()).messages || []);
      if (sRes.ok) setStats(await sRes.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  var filteredColleges = searchSkill
    ? colleges.filter(function(c: any) {
        return c.topSkills?.some(function(s: string) { return s.toLowerCase().includes(searchSkill.toLowerCase()); });
      })
    : colleges;

  if (loading) {
    return (
      <div className="flex h-screen bg-[#f5f6fa]">
        
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6c47ff] to-[#a78bfa] animate-pulse mx-auto mb-4 flex items-center justify-center text-2xl">🏢</div>
            <p className="text-slate-500">Loading employer dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f6fa]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        .animate-in { animation: fadeIn 0.4s ease forwards; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>

      

      <main className="flex-1 overflow-y-auto">
        {/* HEADER */}
        <div className="bg-white border-b px-8 py-5 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1a1f3c]" style={{ fontFamily: "'Syne', sans-serif" }}>
                👋 Welcome, {user?.fullName || user?.company || "Employer"}!
              </h1>
              <p className="text-sm text-slate-500 mt-1">Manage your campus hiring pipeline</p>
            </div>
            <button onClick={function() { navigate("/employer/jobs/new"); }}
              className="px-5 py-2.5 bg-[#6c47ff] text-white text-sm font-bold rounded-xl hover:bg-[#5a3de0] transition-all shadow-md flex items-center gap-2">
              + Post New Job
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 mt-5">
            {[
              { label: "Active Jobs", value: jobs.filter(function(j: any) { return j.status === "active"; }).length, icon: "📋", color: "#6c47ff" },
              { label: "Total Applicants", value: jobs.reduce(function(sum: number, j: any) { return sum + (j.applications?.length || 0); }, 0), icon: "👥", color: "#3cc68a" },
              { label: "Colleges Connected", value: colleges.length, icon: "🏫", color: "#F59E0B" },
              { label: "Messages", value: messages.filter(function(m: any) { return m.unread > 0; }).length, icon: "💬", color: "#EF4444" }
            ].map(function(stat, i) {
              return (
                <div key={i} className="bg-white border rounded-xl p-4 flex items-center gap-4 animate-in" style={{ animationDelay: (i * 0.1) + 's' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: stat.color + "15" }}>{stat.icon}</div>
                  <div><p className="text-2xl font-bold text-[#1a1f3c]">{stat.value}</p><p className="text-xs text-slate-500">{stat.label}</p></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TABS */}
        <div className="px-8 pt-6">
          <div className="flex gap-1 bg-white rounded-xl p-1 border w-fit mb-6">
            {[
              { id: "rankings", label: "🏆 College Rankings" },
              { id: "jobs", label: "📋 My Jobs" },
              { id: "messages", label: "💬 Messages" }
            ].map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id); }}
                  className={"px-5 py-2.5 rounded-lg text-sm font-semibold transition-all " + (activeTab === tab.id ? "bg-[#6c47ff] text-white shadow-md" : "text-slate-600 hover:bg-slate-50")}>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-8 pb-10">
          {/* COLLEGE RANKINGS */}
          {activeTab === "rankings" && (
            <div className="animate-in">
              <div className="flex items-center gap-4 mb-5">
                <div className="relative flex-1 max-w-md">
                  <input type="text" placeholder="🔍 Search by skills (e.g. React, Python)..." value={searchSkill}
                    onChange={function(e: any) { setSearchSkill(e.target.value); }}
                    className="w-full bg-white border-2 border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6c47ff] transition-all pl-10" />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                </div>
              </div>

              {filteredColleges.length === 0 ? (
                <div className="bg-white border rounded-2xl p-12 text-center">
                  <span className="text-5xl mb-4 block">🏫</span>
                  <p className="text-slate-600 font-medium">No colleges found</p>
                  <p className="text-slate-400 text-sm mt-1">Colleges will appear once students register</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredColleges.map(function(college: any, i: number) {
                    return (
                      <div key={college.id} onClick={function() { setSelectedCollege(college); }}
                        className="bg-white border rounded-2xl p-5 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer animate-in" style={{ animationDelay: (i * 0.05) + 's' }}>
                        <div className="flex items-center gap-4">
                          <div className={"w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold " + (i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-slate-100 text-slate-600" : i === 2 ? "bg-amber-100 text-amber-700" : "bg-slate-50 text-slate-500")}>
                            #{college.rank || i + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-[#1a1f3c]">{college.name || college.college}</h3>
                            <p className="text-xs text-slate-500">{college.totalStudents || 0} students • {college.placedStudents || 0} placed</p>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <p className="font-bold text-[#1a1f3c]">{college.placementRate || 0}%</p>
                              <p className="text-[10px] text-slate-400">Placement</p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-[#1a1f3c]">₹{(college.avgPackage || 0) / 100000}L</p>
                              <p className="text-[10px] text-slate-400">Avg Package</p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-[#6c47ff]">{college.score || 0}</p>
                              <p className="text-[10px] text-slate-400">Score</p>
                            </div>
                            <div className="flex gap-1">
                              {(college.topSkills || []).slice(0, 3).map(function(skill: string) {
                                return <span key={skill} className="text-[10px] bg-[#6c47ff]/10 text-[#6c47ff] px-2 py-1 rounded-full font-medium">{skill}</span>;
                              })}
                            </div>
                          </div>
                          <span className="text-slate-400 text-xl">→</span>
                        </div>

                        {/* Expanded College Details */}
                        {selectedCollege && selectedCollege.id === college.id && (
                          <div className="mt-4 pt-4 border-t animate-in">
                            <h4 className="font-bold text-sm mb-3">📊 College Performance</h4>
                            <div className="grid grid-cols-4 gap-3 mb-4">
                              {[
                                { label: "Total Students", value: college.totalStudents || 0 },
                                { label: "Placed Students", value: college.placedStudents || 0 },
                                { label: "Placement Rate", value: (college.placementRate || 0) + "%" },
                                { label: "Avg Package", value: "₹" + ((college.avgPackage || 0) / 100000) + "L" }
                              ].map(function(s: any) {
                                return (
                                  <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                                    <p className="text-lg font-bold text-[#1a1f3c]">{s.value}</p>
                                    <p className="text-[10px] text-slate-500">{s.label}</p>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex gap-2">
                              <button onClick={function() { navigate("/employer/college/" + college.id); }}
                                className="px-4 py-2 bg-[#6c47ff] text-white text-xs font-bold rounded-lg hover:bg-[#5a3de0]">View Students</button>
                              <button onClick={function() { navigate("/employer/messages/" + college.id); }}
                                className="px-4 py-2 border text-xs font-bold rounded-lg hover:bg-slate-50">Message TPO</button>
                              <button onClick={function() { navigate("/employer/jobs/new?college=" + college.id); }}
                                className="px-4 py-2 border text-xs font-bold rounded-lg hover:bg-slate-50">Post Job Here</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* MY JOBS */}
          {activeTab === "jobs" && (
            <div className="animate-in">
              {jobs.length === 0 ? (
                <div className="bg-white border rounded-2xl p-12 text-center">
                  <span className="text-5xl mb-4 block">📋</span>
                  <p className="text-slate-600 font-medium">No jobs posted yet</p>
                  <button onClick={function() { navigate("/employer/jobs/new"); }}
                    className="mt-4 px-6 py-2.5 bg-[#6c47ff] text-white text-sm font-bold rounded-xl hover:bg-[#5a3de0]">Post Your First Job</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map(function(job: any, i: number) {
                    return (
                      <div key={job.id} className="bg-white border rounded-2xl p-5 hover:shadow-lg transition-all animate-in" style={{ animationDelay: (i * 0.05) + 's' }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#6c47ff]/10 flex items-center justify-center text-lg">💼</div>
                            <div>
                              <h3 className="font-bold text-[#1a1f3c]">{job.title}</h3>
                              <p className="text-xs text-slate-500">{job.type} • {job.location || "Remote"} • Posted {job.postedDate || job.createdAt}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={"text-xs font-bold px-3 py-1 rounded-full " + (job.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
                              {job.status}
                            </span>
                            <span className="text-sm text-slate-500">{job.applications?.length || 0} applicants</span>
                            <button onClick={function() { navigate("/employer/jobs/" + job.id); }}
                              className="px-4 py-2 text-xs font-bold rounded-lg border hover:bg-slate-50">View</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* MESSAGES */}
          {activeTab === "messages" && (
            <div className="animate-in">
              {messages.length === 0 ? (
                <div className="bg-white border rounded-2xl p-12 text-center">
                  <span className="text-5xl mb-4 block">💬</span>
                  <p className="text-slate-600 font-medium">No messages yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map(function(msg: any, i: number) {
                    return (
                      <div key={msg.id} onClick={function() { navigate("/employer/messages/" + msg.collegeId); }}
                        className="bg-white border rounded-2xl p-5 hover:shadow-lg cursor-pointer animate-in flex items-center gap-4" style={{ animationDelay: (i * 0.05) + 's' }}>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6c47ff] to-[#a78bfa] flex items-center justify-center text-white font-bold text-lg">
                          {(msg.college || "C")[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-[#1a1f3c]">{msg.college || "College"}</h3>
                            <span className="text-xs text-slate-400">{msg.time || msg.updatedAt}</span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{msg.lastMessage || msg.text || "No messages"}</p>
                        </div>
                        {msg.unread > 0 && <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">{msg.unread}</span>}
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