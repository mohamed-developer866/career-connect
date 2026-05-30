import { useState, useEffect } from "react";
import { useOutletContext } from "react-router";
import Sidebar from "../../../components/Sidebar";

const AI_TIPS = [
  "This job matches your React skills perfectly! Apply soon — the deadline is close. 🎯",
  "Great salary range! Your profile is a strong match for this role. 💰",
  "Quick apply! This company is actively hiring freshers from your college. 🚀",
  "High demand role! You have 3 of the 5 required skills. Upskill the rest. 📈",
  "Deadline approaching! Don't miss this opportunity. Apply today. ⏰",
];

export default function JobBoard() {
  const { user } = useOutletContext<any>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [aiTip, setAiTip] = useState("");
  const [filter, setFilter] = useState<"all" | "fulltime" | "internship" | "expiring">("all");
  const [submitting, setSubmitting] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [showRequirements, setShowRequirements] = useState(false);

  useEffect(() => { 
    loadJobs(); 
    loadMyApplications(); 
  }, []);

  const loadJobs = async () => {
    try { 
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/jobs/approved", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const jobsList = data.jobs || data || [];
        setJobs(jobsList);
        if (jobsList.length > 0) {
          setSelectedJob(jobsList[0]);
          setShowDetail(true);
          setAiTip(AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)]);
        }
      }
    } 
    catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const loadMyApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/applications/my", { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (res.ok) { 
        const apps = await res.json(); 
        const appliedIds = apps.map((a: any) => a.jobId);
        setAppliedJobs(appliedIds);
      }
    } catch (err) { console.error(err); }
  };

  const getMatchScore = function(studentSkills: string, jobSkills: string) {
    if (!jobSkills) return 0;
    const sSkills = (studentSkills || "").toLowerCase().split(',').map((s: string) => s.trim());
    const jSkills = jobSkills.toLowerCase().split(',').map((s: string) => s.trim());
    if (jSkills.length === 0) return 0;
    const match = jSkills.filter((skill: string) => 
      sSkills.some((s: string) => s.includes(skill) || skill.includes(s))
    );
    return Math.round((match.length / jSkills.length) * 100);
  };

  const userSkills = user?.skills?.map((s: any) => s.name).join(', ') || "React, JavaScript, HTML";

  const hasAppliedToJob = (jobId: string) => appliedJobs.includes(jobId);

  const handleJobClick = (job: any) => {
    setSelectedJob(job);
    setAiTip(AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)]);
    setShowDetail(true);
    setShowRequirements(false);
    setShowResumeUpload(false);
    setResume(null);
  };

  const handleApply = async () => {
  if (!selectedJob) return;
  
  // Check if already applied (from local state)
  if (hasAppliedToJob(selectedJob.id)) {
    alert("You have already applied for this position!");
    return;
  }
  
  if (!showResumeUpload) { 
    setShowResumeUpload(true); 
    return; 
  }
  
  setSubmitting(true);
  try {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    let resumeData = null;
    
    if (resume) {
      const reader = new FileReader();
      resumeData = await new Promise((resolve) => { 
        reader.onload = () => resolve(reader.result); 
        reader.readAsDataURL(resume); 
      });
    }
    
    const res = await fetch("http://localhost:5000/api/applications/apply", {
      method: "POST", 
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ 
        jobId: selectedJob.id, 
        studentName: userData.fullName || "Student", 
        studentEmail: userData.email || "student@email.com", 
        college: userData.college || "AMSCE Chennai", 
        department: userData.department || "Computer Science", 
        resume: resumeData 
      }),
    });
    
    const data = await res.json();
    
    if (res.ok) { 
      // Success - update applied jobs list
      setAppliedJobs([...appliedJobs, selectedJob.id]);
      setShowResumeUpload(false); 
      setResume(null);
      alert("Application submitted successfully!");
    } else {
      // Check if it's a duplicate error
      if (data.alreadyApplied || data.error?.includes("already applied")) {
        alert("You have already applied for this position!");
        // Refresh the applied jobs list to update UI
        loadMyApplications();
      } else {
        alert(data.error || "Apply failed");
      }
    }
  } catch (err) { 
    console.error(err); 
    alert("Failed to apply."); 
  } finally { 
    setSubmitting(false); 
  }
};

  const getDaysLeft = (deadline: string) => Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const deadlineStatus = (days: number) => {
    if (days < 0) return { label: "Expired", bg: "bg-rose-50 text-rose-600", icon: "⛔" };
    if (days <= 3) return { label: `${days}d left!`, bg: "bg-rose-50 text-rose-600", icon: "🔥" };
    if (days <= 7) return { label: `${days}d left`, bg: "bg-amber-50 text-amber-600", icon: "⏰" };
    return { label: `${days}d left`, bg: "bg-emerald-50 text-emerald-600", icon: "✅" };
  };

  const formatSalary = (min: number, max: number) => {
    const minL = (min / 100000).toFixed(1), maxL = (max / 100000).toFixed(1);
    return minL === maxL ? `₹${minL}L` : `₹${minL}L - ₹${maxL}L`;
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === "fulltime") return job.type === "Full-time";
    if (filter === "internship") return job.type === "Internship";
    if (filter === "expiring") return getDaysLeft(job.deadline) <= 7 && getDaysLeft(job.deadline) >= 0;
    return true;
  });

  useEffect(() => {
    if (filteredJobs.length > 0 && !selectedJob) {
      setSelectedJob(filteredJobs[0]);
      setShowDetail(true);
    }
  }, [filteredJobs]);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Syne:wght@600;700;800&display=swap');
        
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .job-card {
          animation: fadeSlide 0.3s ease both;
          transition: all 0.25s ease;
          cursor: pointer;
        }
        
        .job-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px -12px rgba(0, 0, 0, 0.15);
        }
        
        .job-card-selected {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-left: 3px solid #fbbf24;
          box-shadow: 0 8px 20px -12px rgba(16, 185, 129, 0.5);
        }
        
        .job-card-selected h3, 
        .job-card-selected p,
        .job-card-selected span {
          color: white !important;
        }
        
        .job-card-selected .bg-slate-100,
        .job-card-selected .bg-emerald-50 {
          background: rgba(255, 255, 255, 0.2) !important;
          color: white !important;
        }
        
        .detail-panel {
          animation: slideRight 0.3s ease forwards;
        }
        
        .filter-active {
          background: #10b981;
          color: white;
          box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
        }
        
        .filter-inactive {
          background: white;
          color: #6b7280;
          border: 1px solid #e5e7eb;
        }
        
        .filter-inactive:hover {
          background: #f9fafb;
          border-color: #10b981;
          color: #10b981;
        }
        
        .apply-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .apply-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: scale(1.02);
        }
        
        .applied-badge {
          background: #d1fae5;
          color: #047857;
          font-weight: 600;
        }
        
        .modal-in {
          animation: fadeSlide 0.2s ease forwards;
        }
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
      
      <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Syne', sans-serif" }}>💼 Job Board</h1>
            <p className="text-xs text-slate-400 mt-0.5">{filteredJobs.length} opportunities available</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setFilter("all")} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === "all" ? "filter-active" : "filter-inactive"}`}>All</button>
            <button onClick={() => setFilter("fulltime")} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === "fulltime" ? "filter-active" : "filter-inactive"}`}>Full-time</button>
            <button onClick={() => setFilter("internship")} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === "internship" ? "filter-active" : "filter-inactive"}`}>Internship</button>
            <button onClick={() => setFilter("expiring")} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${filter === "expiring" ? "filter-active" : "filter-inactive"}`}>🔥 Urgent</button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Job List */}
          <div className={`${showDetail ? "w-[42%]" : "flex-1"} bg-white border-r border-slate-100 flex flex-col transition-all duration-300 overflow-hidden shadow-sm`}>
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{animationDelay:"0.15s"}}></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{animationDelay:"0.3s"}}></div>
                  </div>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <span className="text-4xl mb-2 block">🔍</span>
                    <p className="text-slate-500 text-sm">No matching jobs</p>
                  </div>
                </div>
              ) : (
                filteredJobs.map((job, i) => {
                  const days = getDaysLeft(job.deadline);
                  const dl = deadlineStatus(days);
                  const isSelected = selectedJob?.id === job.id;
                  const isJobApplied = hasAppliedToJob(job.id);
                  const matchScore = getMatchScore(userSkills, job.skills);
                  
                  return (
                    <div 
                      key={job.id} 
                      onClick={() => handleJobClick(job)}
                      className={`job-card p-4 mb-2 rounded-xl transition-all ${isSelected ? "job-card-selected" : "hover:bg-slate-50 border border-slate-100"}`} 
                      style={{ animationDelay: `${i * 0.03}s` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0 ${isSelected ? "bg-amber-500" : "bg-emerald-500"}`}>
                          {job.company?.charAt(0) || "C"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className={`font-semibold text-sm line-clamp-1 ${isSelected ? "text-white" : "text-slate-800"}`}>{job.title}</h3>
                              <p className={`text-xs mt-0.5 ${isSelected ? "text-white/80" : "text-slate-400"}`}>{job.company}</p>
                            </div>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${isSelected ? "bg-white/20 text-white" : dl.bg}`}>
                              {dl.icon} {dl.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-3 text-[11px] mt-2 ${isSelected ? "text-white/80" : "text-slate-500"}`}>
                        <span className="flex items-center gap-0.5">📍 {job.location}</span>
                        <span className={`w-1 h-1 rounded-full ${isSelected ? "bg-white/30" : "bg-slate-300"}`}></span>
                        <span className="flex items-center gap-0.5">💰 {formatSalary(job.salaryMin, job.salaryMax)}</span>
                        <span className={`w-1 h-1 rounded-full ${isSelected ? "bg-white/30" : "bg-slate-300"}`}></span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${isSelected ? "bg-white/20 text-white" : matchScore >= 70 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          🤖 {matchScore}%
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.skills?.split(',').slice(0, 3).map((skill: string) => (
                          <span key={skill} className={`text-[9px] px-1.5 py-0.5 rounded ${isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                            {skill.trim()}
                          </span>
                        ))}
                        {job.skills?.split(',').length > 3 && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded ${isSelected ? "bg-white/20 text-white/80" : "bg-slate-100 text-slate-400"}`}>+{job.skills.split(',').length - 3}</span>
                        )}
                      </div>
                      
                      {/* Show Applied Badge or Apply Button */}
                      {isJobApplied ? (
                        <div className="mt-2.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium applied-badge px-2 py-0.5 rounded-full">
                            <span>✅</span> Applied
                          </span>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setSelectedJob(job);
                            setShowDetail(true);
                          }}
                          className="mt-2.5 w-full py-1.5 rounded-lg text-[11px] font-medium transition-all apply-btn"
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Job Detail */}
          {showDetail && selectedJob && (
            <div className="detail-panel flex-1 flex flex-col overflow-hidden bg-white shadow-sm">
              {/* Header */}
              <div className="border-b border-slate-100 px-5 py-4 flex-shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                      {selectedJob.company?.charAt(0) || "C"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-bold text-slate-800 truncate" style={{ fontFamily: "'Syne', sans-serif" }}>{selectedJob.title}</h2>
                      <p className="text-emerald-600 font-medium text-xs">{selectedJob.company}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 flex-wrap">
                        <span>📍 {selectedJob.location}</span>
                        <span>💰 {formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}</span>
                        <span>📋 {selectedJob.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Apply Button in Header */}
                  {hasAppliedToJob(selectedJob.id) ? (
                    <button disabled className="px-5 py-2 rounded-lg text-sm font-medium applied-badge flex items-center gap-2">
                      ✅ Applied
                    </button>
                  ) : (
                    <button 
                      onClick={handleApply}
                      disabled={submitting}
                      className="px-5 py-2 rounded-lg text-sm font-medium transition-all apply-btn flex items-center gap-2"
                    >
                      {submitting ? "⏳ Processing..." : "📤 Apply Now"}
                    </button>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Deadline Alert */}
                {(() => {
                  const days = getDaysLeft(selectedJob.deadline);
                  const dl = deadlineStatus(days);
                  return (
                    <div className={`p-3 rounded-xl ${dl.bg}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{dl.icon}</span>
                        <div>
                          <p className={`text-xs font-medium ${dl.bg.replace('bg-', 'text-')}`}>
                            {days < 0 ? "Deadline passed" : days <= 3 ? "🔥 Deadline approaching fast!" : days <= 7 ? "⏰ Apply soon" : "✅ Application open"}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Deadline: {new Date(selectedJob.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* AI Tip */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-100">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-sm shadow-sm flex-shrink-0">🤖</div>
                    <div>
                      <p className="text-[11px] font-semibold text-emerald-700">Zara's Insight</p>
                      <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{aiTip}</p>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-800 rounded-xl p-3 text-white">
                    <p className="text-[9px] text-slate-400 uppercase">Salary</p>
                    <p className="text-sm font-semibold">{formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}</p>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-3 text-white">
                    <p className="text-[9px] text-slate-400 uppercase">Type</p>
                    <p className="text-sm font-semibold text-emerald-400">{selectedJob.type}</p>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-3 text-white">
                    <p className="text-[9px] text-slate-400 uppercase">Match</p>
                    <p className="text-sm font-semibold text-emerald-400">{getMatchScore(userSkills, selectedJob.skills)}%</p>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-slate-700 mb-2">📝 Description</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{selectedJob.description}</p>
                </div>

                {/* Skills */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-slate-700 mb-2">🛠️ Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.skills?.split(',').map((skill: string) => (
                      <span key={skill} className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-medium text-slate-600">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                {selectedJob.requirements && (
                  <div className="bg-slate-50 rounded-xl overflow-hidden">
                    <button 
                      onClick={() => setShowRequirements(!showRequirements)} 
                      className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
                    >
                      <span>📋 Requirements</span>
                      <span className={`text-sm transition-transform duration-200 ${showRequirements ? "rotate-180" : ""}`}>▼</span>
                    </button>
                    {showRequirements && (
                      <div className="px-4 pb-4 pt-0">
                        <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">{selectedJob.requirements}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-white border-t border-slate-100 px-5 py-3 flex items-center justify-between flex-shrink-0">
                <span className="text-[10px] text-slate-400">Posted by {selectedJob.company}</span>
                <div className="flex gap-2">
                  <button onClick={() => setShowDetail(false)} className="px-4 py-1.5 border border-slate-200 text-slate-500 text-xs font-medium rounded-lg hover:bg-slate-50 transition-all">
                    Back
                  </button>
                  
                  {/* Apply Button in Footer */}
                  {hasAppliedToJob(selectedJob.id) ? (
                    <button disabled className="px-5 py-1.5 rounded-lg text-xs font-medium applied-badge">
                      ✅ Applied
                    </button>
                  ) : (
                    <button 
                      onClick={handleApply}
                      disabled={submitting}
                      className="px-5 py-1.5 rounded-lg text-xs font-medium transition-all apply-btn"
                    >
                      {submitting ? "Processing..." : "Apply Now"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Resume Upload Modal */}
      {showResumeUpload && !hasAppliedToJob(selectedJob?.id) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowResumeUpload(false)}>
          <div className="bg-white rounded-xl p-5 max-w-sm w-full mx-4 shadow-xl modal-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-800 mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>📄 Upload Resume</h3>
            <p className="text-xs text-slate-500 mb-3">
              Applying for <span className="font-medium text-slate-700">{selectedJob?.title}</span> at {selectedJob?.company}
            </p>
            <label className="block w-full p-5 border-2 border-dashed border-slate-200 rounded-xl text-center cursor-pointer hover:border-emerald-500 transition-all mb-4">
              <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => { const file = e.target.files?.[0]; if (file && file.size > 2 * 1024 * 1024) { alert("Max 2MB"); return; } setResume(file || null); }} className="hidden" />
              {resume ? (
                <div>
                  <span className="text-2xl block mb-1">📄</span>
                  <p className="text-xs font-semibold text-emerald-600">{resume.name}</p>
                </div>
              ) : (
                <div>
                  <span className="text-3xl block mb-1">📤</span>
                  <p className="text-xs font-medium text-slate-600">Click to upload resume</p>
                  <p className="text-[9px] text-slate-400 mt-1">PDF, DOC up to 2MB</p>
                </div>
              )}
            </label>
            <div className="flex gap-2">
              <button onClick={() => { setShowResumeUpload(false); setResume(null); }} className="flex-1 py-2 border border-slate-200 text-slate-500 text-xs font-medium rounded-lg hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button onClick={handleApply} disabled={submitting} className="flex-1 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-all">
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}