import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router";
import Sidebar from "../../../components/Sidebar";

const AI_TIPS = [
  "This job matches your React skills perfectly! Apply soon — the deadline is close. 🎯",
  "Great salary range! Your profile is a strong match for this role. 💰",
  "Quick apply! This company is actively hiring freshers from your college. 🚀",
  "High demand role! You have 3 of the 5 required skills. Upskill the rest. 📈",
  "Deadline approaching! Don't miss this opportunity. Apply today. ⏰",
  "Your portfolio looks impressive for this role! 🌟",
  "Top skills match! You're in the top 20% of applicants. 🏆",
  "Company has great reviews! Don't miss this chance. ⭐",
];

export default function JobBoard() {
  const navigate = useNavigate();
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
  const [showRequirements, setShowRequirements] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  useEffect(() => { 
    loadJobs(); 
    loadSavedJobs();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadSavedJobs = () => {
    const saved = localStorage.getItem("savedJobs");
    if (saved) {
      try {
        setSavedJobs(new Set(JSON.parse(saved)));
      } catch (e) {
        setSavedJobs(new Set());
      }
    }
  };

  const saveJob = (jobId: string) => {
    const newSaved = new Set(savedJobs);
    if (newSaved.has(jobId)) {
      newSaved.delete(jobId);
      showToast("Job removed from saved", "success");
    } else {
      newSaved.add(jobId);
      showToast("Job saved for later", "success");
    }
    setSavedJobs(newSaved);
    localStorage.setItem("savedJobs", JSON.stringify([...newSaved]));
  };

  const loadJobs = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    try {
      // Get all approved jobs
      const jobsRes = await fetch("http://localhost:5000/api/jobs/approved", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const jobsData = await jobsRes.json();
      const allJobs = jobsData.jobs || jobsData || [];
      
      // Get my applications to filter out applied jobs
      const appsRes = await fetch("http://localhost:5000/api/applications/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const appsData = await appsRes.json();
      const myApplications = appsData.applications || appsData || [];
      
      // Get IDs of jobs already applied to
      const appliedJobIds = new Set(myApplications.map((app: any) => app.jobId));
      
      // Filter out applied jobs
      const notAppliedJobs = allJobs.filter((job: any) => !appliedJobIds.has(job.id));
      
      // Filter out expired jobs
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const validJobs = notAppliedJobs.filter((job: any) => {
        if (!job.deadline) return true;
        const deadline = new Date(job.deadline);
        deadline.setHours(0, 0, 0, 0);
        return deadline >= today;
      });
      
      console.log(`📊 Total jobs: ${allJobs.length}, Applied: ${appliedJobIds.size}, Available: ${validJobs.length}`);
      
      setJobs(validJobs);
      
      if (validJobs.length > 0 && !selectedJob) {
        setSelectedJob(validJobs[0]);
        setShowDetail(true);
        setAiTip(AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)]);
      } else if (validJobs.length === 0) {
        setShowDetail(false);
        setSelectedJob(null);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load jobs", "error");
    } finally {
      setLoading(false);
    }
  };

  const getMatchScore = (studentSkills: string, jobSkills: string) => {
    if (!jobSkills) return 0;
    const sSkills = (studentSkills || "").toLowerCase().split(',').map((s: string) => s.trim());
    const jSkills = jobSkills.toLowerCase().split(',').map((s: string) => s.trim());
    if (jSkills.length === 0) return 0;
    const match = jSkills.filter((skill: string) => 
      sSkills.some((s: string) => s.includes(skill) || skill.includes(s))
    );
    return Math.round((match.length / jSkills.length) * 100);
  };

  const userSkills = user?.skills?.map((s: any) => s.name).join(', ') || "React, JavaScript, HTML, CSS, Node.js";

  const isJobSaved = (jobId: string) => savedJobs.has(jobId);

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
    
    if (!showResumeUpload) { 
      setShowResumeUpload(true); 
      return; 
    }
    
    if (!resume) {
      showToast("Please upload your resume", "error");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      
      const formData = new FormData();
      formData.append("jobId", selectedJob.id);
      formData.append("studentName", userData.fullName || user?.fullName || "Student");
      formData.append("studentEmail", userData.email || user?.email || "student@email.com");
      formData.append("college", userData.college || user?.college || "AMSCE Chennai");
      formData.append("department", userData.department || user?.department || "Computer Science");
      formData.append("resume", resume);
      
      const res = await fetch("http://localhost:5000/api/applications/apply", {
        method: "POST", 
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      const data = await res.json();
      
      if (res.ok) { 
        showToast("Application submitted successfully! 🎉", "success");
        setShowResumeUpload(false); 
        setResume(null);
        // Refresh jobs list - the applied job will disappear!
        await loadJobs();
        setShowDetail(false);
        setSelectedJob(null);
      } else {
        if (data.alreadyApplied) {
          showToast("You have already applied for this job!", "error");
          await loadJobs(); // Refresh to remove it from list
        } else {
          showToast(data.error || "Application failed. Please try again.", "error");
        }
      }
    } catch (err) { 
      console.error(err); 
      showToast("Network error. Please check your connection.", "error");
    } finally { 
      setSubmitting(false); 
    }
  };

  const getDaysLeft = (deadline: string) => {
    if (!deadline) return 30;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    return Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const deadlineStatus = (days: number) => {
    if (days < 0) return { label: "Expired", bg: "bg-gray-500", icon: "⛔", textColor: "text-white" };
    if (days === 0) return { label: "Last day!", bg: "bg-red-500", icon: "🔥", textColor: "text-white" };
    if (days <= 2) return { label: `${days}d left`, bg: "bg-orange-500", icon: "⚠️", textColor: "text-white" };
    if (days <= 5) return { label: `${days}d left`, bg: "bg-amber-500", icon: "⏰", textColor: "text-white" };
    if (days <= 7) return { label: `${days}d left`, bg: "bg-blue-500", icon: "⏳", textColor: "text-white" };
    return { label: `${days}d left`, bg: "bg-green-500", icon: "✅", textColor: "text-white" };
  };

  const formatSalary = (min: number, max: number) => {
    const minL = (min / 100000).toFixed(1), maxL = (max / 100000).toFixed(1);
    return minL === maxL ? `₹${minL}L` : `₹${minL}L - ₹${maxL}L`;
  };

  const filteredJobs = (Array.isArray(jobs) ? jobs : []).filter(job => {
    if (filter === "fulltime") return job.type === "Full-time";
    if (filter === "internship") return job.type === "Internship";
    if (filter === "expiring") return getDaysLeft(job.deadline) <= 7 && getDaysLeft(job.deadline) >= 0;
    return true;
  }).filter(job => {
    if (!searchTerm) return true;
    return (job.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
           (job.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
           (job.skills || "").toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30" style={{ fontFamily: "'Inter', sans-serif" }}>
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
          border-radius: 16px;
        }
        
        .job-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px -12px rgba(59, 130, 246, 0.25);
        }
        
        .job-card-selected {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border-left: 3px solid #3b82f6;
          box-shadow: 0 8px 20px -12px rgba(59, 130, 246, 0.3);
        }
        
        .detail-panel {
          animation: slideRight 0.3s ease forwards;
        }
        
        .filter-active {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }
        
        .filter-inactive {
          background: white;
          color: #6b7280;
          border: 1px solid #e5e7eb;
        }
        
        .filter-inactive:hover {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #3b82f6;
        }
        
        .apply-btn {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          font-weight: 600;
          transition: all 0.2s ease;
          border-radius: 10px;
        }
        
        .apply-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          transform: scale(1.02);
        }
        
        .toast-in {
          animation: slideLeft 0.3s ease forwards;
        }
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; }
      `}</style>
      
      <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Toast Notification */}
        {toast && (
          <div className="absolute top-4 right-4 z-50 toast-in">
            <div className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
              <span>{toast.type === "success" ? "🎉" : "⚠️"}</span>
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-blue-100 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-blue-800" style={{ fontFamily: "'Syne', sans-serif" }}>💼 Job Board</h1>
            <p className="text-xs text-blue-500 mt-0.5">{filteredJobs.length} opportunities available</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search jobs, companies..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          
          {/* My Applications Button */}
          <button 
            onClick={() => navigate("/student/applications")}
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-md flex items-center gap-2"
          >
            📋 My Applications
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 border-b border-blue-100 bg-white/50 flex items-center gap-2">
          <span className="text-xs text-slate-500 mr-2">Filter:</span>
          <button onClick={() => setFilter("all")} className={`px-3 py-1 rounded-lg text-[10px] font-medium transition-all ${filter === "all" ? "filter-active" : "bg-gray-100 text-slate-600 hover:bg-gray-200"}`}>All</button>
          <button onClick={() => setFilter("fulltime")} className={`px-3 py-1 rounded-lg text-[10px] font-medium transition-all ${filter === "fulltime" ? "filter-active" : "bg-gray-100 text-slate-600 hover:bg-gray-200"}`}>Full-time</button>
          <button onClick={() => setFilter("internship")} className={`px-3 py-1 rounded-lg text-[10px] font-medium transition-all ${filter === "internship" ? "filter-active" : "bg-gray-100 text-slate-600 hover:bg-gray-200"}`}>Internship</button>
          <button onClick={() => setFilter("expiring")} className={`px-3 py-1 rounded-lg text-[10px] font-medium transition-all ${filter === "expiring" ? "filter-active" : "bg-gray-100 text-slate-600 hover:bg-gray-200"}`}>🔥 Urgent</button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden p-4 gap-4">
          {/* Job List - Left Column */}
          <div className={`${showDetail ? "w-[42%]" : "flex-1"} bg-white rounded-xl shadow-sm border border-blue-100 flex flex-col transition-all duration-300 overflow-hidden`}>
            <div className="px-4 py-2 border-b border-blue-100 bg-blue-50/30">
              <h3 className="text-xs font-semibold text-blue-700">📌 Available Jobs</h3>
              <p className="text-[9px] text-blue-500">Jobs you can apply to (applied jobs are hidden)</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{animationDelay:"0.15s"}}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{animationDelay:"0.3s"}}></div>
                  </div>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <span className="text-4xl mb-2 block">🎉</span>
                    <p className="text-slate-500 text-sm">No jobs available</p>
                    <p className="text-slate-400 text-xs mt-1">You've applied to all jobs or no jobs match</p>
                    <button 
                      onClick={() => navigate("/student/applications")}
                      className="mt-3 px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-lg hover:bg-emerald-600 transition"
                    >
                      View My Applications
                    </button>
                  </div>
                </div>
              ) : (
                filteredJobs.map((job, i) => {
                  const days = getDaysLeft(job.deadline);
                  const dl = deadlineStatus(days);
                  const isSelected = selectedJob?.id === job.id;
                  const isSaved = isJobSaved(job.id);
                  const matchScore = getMatchScore(userSkills, job.skills);
                  const isExpired = days < 0;
                  
                  return (
                    <div 
                      key={job.id} 
                      onClick={() => !isExpired && handleJobClick(job)}
                      className={`job-card p-4 transition-all ${isSelected ? "job-card-selected" : "bg-white border border-blue-100 hover:border-blue-300"} ${isExpired ? "opacity-60" : ""}`} 
                      style={{ animationDelay: `${i * 0.03}s` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${isSelected ? "from-blue-500 to-indigo-600" : "from-blue-400 to-blue-600"} flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0`}>
                          {job.company?.charAt(0) || "C"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className={`font-semibold text-sm line-clamp-1 ${isSelected ? "text-blue-800" : "text-slate-800"}`}>{job.title}</h3>
                              <p className={`text-xs mt-0.5 ${isSelected ? "text-blue-600" : "text-slate-400"}`}>{job.company}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={(e) => { e.stopPropagation(); saveJob(job.id); }}
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isSaved ? "text-amber-500" : "text-gray-400 hover:text-amber-500"}`}
                              >
                                {isSaved ? "⭐" : "☆"}
                              </button>
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${dl.bg} ${dl.textColor}`}>
                                {dl.icon} {dl.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-3 text-[11px] mt-2 ${isSelected ? "text-slate-600" : "text-slate-500"}`}>
                        <span className="flex items-center gap-0.5">📍 {job.location}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="flex items-center gap-0.5">💰 {formatSalary(job.salaryMin, job.salaryMax)}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${matchScore >= 70 ? "bg-blue-100 text-blue-700" : matchScore >= 40 ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                          🤖 {matchScore}% Match
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.skills?.split(',').slice(0, 3).map((skill: string) => (
                          <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                            {skill.trim()}
                          </span>
                        ))}
                        {job.skills?.split(',').length > 3 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">+{job.skills.split(',').length - 3}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Job Detail Panel */}
          {showDetail && selectedJob && (
            <div className="detail-panel flex-1 flex flex-col overflow-hidden bg-white rounded-xl shadow-sm border border-blue-100">
              {/* Header */}
              <div className="border-b border-blue-100 px-5 py-4 flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                      {selectedJob.company?.charAt(0) || "C"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-bold text-slate-800 truncate" style={{ fontFamily: "'Syne', sans-serif" }}>{selectedJob.title}</h2>
                      <p className="text-blue-600 font-medium text-xs">{selectedJob.company}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 flex-wrap">
                        <span>📍 {selectedJob.location}</span>
                        <span>💰 {formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}</span>
                        <span>📋 {selectedJob.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => saveJob(selectedJob.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isJobSaved(selectedJob.id) ? "bg-amber-100 text-amber-500" : "bg-gray-100 text-gray-400 hover:text-amber-500"}`}
                    >
                      {isJobSaved(selectedJob.id) ? "⭐" : "☆"}
                    </button>
                    
                    <button 
                      onClick={handleApply}
                      disabled={submitting}
                      className="px-5 py-2 rounded-lg text-sm font-medium transition-all apply-btn flex items-center gap-2"
                    >
                      {submitting ? "⏳ Processing..." : "📤 Apply Now"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Deadline Alert */}
                {(() => {
                  const days = getDaysLeft(selectedJob.deadline);
                  const dl = deadlineStatus(days);
                  return (
                    <div className={`p-3 rounded-lg ${dl.bg}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{dl.icon}</span>
                        <div>
                          <p className={`text-xs font-medium text-white`}>
                            {days < 0 ? "⛔ Deadline passed" : days === 0 ? "🔥 Last day to apply!" : days <= 2 ? "⚠️ Deadline approaching fast!" : days <= 5 ? "⏰ Apply soon!" : days <= 7 ? "⏳ Limited time left" : "✅ Application open"}
                          </p>
                          <p className="text-[10px] text-white/80 mt-0.5">
                            Deadline: {new Date(selectedJob.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* AI Tip */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm shadow-sm flex-shrink-0 animate-pulse">🤖</div>
                    <div>
                      <p className="text-[11px] font-semibold text-blue-700">Zara's Insight</p>
                      <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{aiTip}</p>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-sm font-semibold text-blue-700">{formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}</p>
                    <p className="text-[9px] text-blue-500 uppercase">Salary</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-sm font-semibold text-blue-700">{selectedJob.type}</p>
                    <p className="text-[9px] text-blue-500 uppercase">Type</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-sm font-semibold text-blue-700">{getMatchScore(userSkills, selectedJob.skills)}%</p>
                    <p className="text-[9px] text-blue-500 uppercase">Match</p>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-slate-700 mb-2">📝 Description</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{selectedJob.description}</p>
                </div>

                {/* Skills */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-slate-700 mb-2">🛠️ Skills Required</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.skills?.split(',').map((skill: string) => {
                      const hasSkill = userSkills.toLowerCase().includes(skill.trim().toLowerCase());
                      return (
                        <span key={skill} className={`px-2 py-1 rounded-md text-[11px] font-medium ${hasSkill ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-500"}`}>
                          {skill.trim()} {hasSkill && "✓"}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Requirements */}
                {selectedJob.requirements && (
                  <div className="bg-slate-50 rounded-lg overflow-hidden">
                    <button 
                      onClick={() => setShowRequirements(!showRequirements)} 
                      className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
                    >
                      <span>📋 Requirements</span>
                      <span className={`text-sm transition-transform duration-200 ${showRequirements ? "rotate-180" : ""}`}>▼</span>
                    </button>
                    {showRequirements && (
                      <div className="px-4 pb-4 pt-0">
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{selectedJob.requirements}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-white border-t border-blue-100 px-5 py-3 flex items-center justify-between flex-shrink-0 rounded-b-xl">
                <span className="text-[10px] text-slate-400">Posted by {selectedJob.company}</span>
                <div className="flex gap-2">
                  <button onClick={() => setShowDetail(false)} className="px-4 py-1.5 border border-blue-200 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-50 transition-all">
                    Back to List
                  </button>
                  
                  <button 
                    onClick={handleApply}
                    disabled={submitting}
                    className="px-5 py-1.5 rounded-lg text-xs font-medium transition-all apply-btn"
                  >
                    {submitting ? "Processing..." : "Apply Now"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Resume Upload Modal */}
      {showResumeUpload && selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowResumeUpload(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-sm">
                📄
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Upload Resume</h3>
                <p className="text-xs text-slate-500">Applying for <span className="font-semibold text-blue-600">{selectedJob?.title}</span></p>
              </div>
            </div>
            
            <label className="block w-full p-6 border-2 border-dashed border-blue-200 rounded-xl text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all mb-4 group">
              <input 
                type="file" 
                accept=".pdf,.doc,.docx" 
                onChange={(e) => { 
                  const file = e.target.files?.[0]; 
                  if (file && file.size > 2 * 1024 * 1024) { 
                    showToast("File size must be less than 2MB", "error"); 
                    return; 
                  } 
                  setResume(file || null); 
                }} 
                className="hidden" 
              />
              {resume ? (
                <div>
                  <span className="text-3xl block mb-2">📄</span>
                  <p className="text-sm font-semibold text-blue-600">{resume.name}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Click to change</p>
                </div>
              ) : (
                <div>
                  <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform">📤</span>
                  <p className="text-sm font-medium text-slate-600">Click or drag to upload resume</p>
                  <p className="text-[10px] text-slate-400 mt-1">PDF, DOC up to 2MB</p>
                </div>
              )}
            </label>
            
            <div className="flex gap-3">
              <button onClick={() => { setShowResumeUpload(false); setResume(null); }} className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button onClick={handleApply} disabled={submitting || !resume} className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}