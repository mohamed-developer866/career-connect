import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router";
import Sidebar from "../../../components/Sidebar";

const statusSteps = ["Applied", "Shortlisted", "Interview", "HIRED"]; // Changed to match backend
const statusColor = (s: string) => {
  const status = (s || "Applied").toUpperCase();
  if (status === "SHORTLISTED") return "bg-amber-100 text-amber-700 border-amber-200";
  if (status === "INTERVIEW") return "bg-purple-100 text-purple-700 border-purple-200";
  if (status === "HIRED") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (status === "REJECTED") return "bg-red-100 text-red-700 border-red-200";
  return "bg-blue-100 text-blue-700 border-blue-200";
};

const statusDot = (s: string) => {
  const status = (s || "Applied").toUpperCase();
  if (status === "SHORTLISTED") return "⭐";
  if (status === "INTERVIEW") return "🎯";
  if (status === "HIRED") return "✅";
  if (status === "REJECTED") return "❌";
  return "📝";
};

const getDisplayStatus = (status: string) => {
  const s = (status || "Applied").toUpperCase();
  if (s === "HIRED") return "Hired";
  if (s === "SHORTLISTED") return "Shortlisted";
  if (s === "INTERVIEW") return "Interview";
  if (s === "REJECTED") return "Rejected";
  return "Applied";
};

export default function MyApplications() {
  const { user } = useOutletContext<any>();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  useEffect(() => { loadApplications(); }, []);

  const loadApplications = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }
    
    try {
      const res = await fetch("http://localhost:5000/api/applications/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        let appsList = [];
        if (data.applications && Array.isArray(data.applications)) {
          appsList = data.applications;
        } else if (Array.isArray(data)) {
          appsList = data;
        } else {
          appsList = [];
        }
        
        setApplications(appsList);
        if (appsList.length > 0) {
          setSelectedApp(appsList[0]);
        }
      } else if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth");
      }
    } catch (err) { 
      console.error("Error loading applications:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const getStatusIndex = (status: string) => {
    const upperStatus = (status || "Applied").toUpperCase();
    const index = statusSteps.findIndex(s => s.toUpperCase() === upperStatus);
    return index !== -1 ? index : 0;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return "Invalid date";
    }
  };

  const getJobTitle = (app: any) => {
    if (app.job?.title) return app.job.title;
    if (app.title) return app.title;
    return `Job ID: ${app.jobId?.slice(0, 8)}...`;
  };

  const getCompanyName = (app: any) => {
    if (app.job?.company) return app.job.company;
    if (app.company) return app.company;
    return "";
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{animationDelay:"0.15s"}}></div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{animationDelay:"0.3s"}}></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Syne:wght@600;700;800&display=swap');
        
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes progressFill {
          from { width: 0; }
          to { width: var(--progress-width); }
        }
        
        .animate-in {
          animation: fadeSlide 0.3s ease both;
        }
        
        .progress-bar {
          animation: progressFill 0.8s ease forwards;
        }
        
        .selected-card {
          border-left: 3px solid #10b981;
          background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
        }
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
      
      <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-5 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Syne', sans-serif" }}>📋 My Applications</h1>
              <p className="text-xs text-slate-400 mt-1">Track your job application status</p>
            </div>
            <button 
              onClick={() => navigate("/student/jobs")} 
              className="px-5 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 transition-all shadow-sm"
            >
              🔍 Browse More Jobs
            </button>
          </div>
        </div>

        <div className="p-6">
          {applications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📭</span>
              </div>
              <h2 className="text-lg font-bold text-slate-700 mb-2">No applications yet</h2>
              <p className="text-sm text-slate-400 mb-4">You haven't applied to any jobs yet.</p>
              <button 
                onClick={() => navigate("/student/jobs")} 
                className="px-5 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 transition-all"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Application List - Left Panel */}
              <div className="lg:col-span-1 space-y-2">
                <h3 className="text-sm font-semibold text-slate-600 mb-3 px-1">Your Applications ({applications.length})</h3>
                {applications.map((app, i) => {
                  const isSelected = selectedApp?.id === app.id;
                  const status = app.status || "Applied";
                  const statusInfo = statusColor(status);
                  const displayStatus = getDisplayStatus(status);
                  const statusIcon = statusDot(status);
                  
                  return (
                    <div 
                      key={app.id || i} 
                      onClick={() => setSelectedApp(app)}
                      className={`animate-in bg-white rounded-xl p-4 border cursor-pointer transition-all hover:shadow-md ${
                        isSelected 
                          ? "selected-card border-emerald-200 shadow-md" 
                          : "border-slate-100 hover:border-emerald-100"
                      }`} 
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                            {getJobTitle(app)}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {getCompanyName(app)}
                          </p>
                        </div>
                        <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full border ${statusInfo} ml-2 shrink-0`}>
                          {statusIcon} {displayStatus}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Applied: {formatDate(app.appliedAt)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Application Detail - Right Panel */}
              <div className="lg:col-span-2">
                {selectedApp && (
                  <div className="animate-in bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 px-6 py-5">
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div>
                          <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Syne', sans-serif" }}>
                            {getJobTitle(selectedApp)}
                          </h2>
                          <p className="text-sm text-emerald-600 font-medium mt-0.5">
                            {getCompanyName(selectedApp)}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Applied on {formatDate(selectedApp.appliedAt)}
                          </p>
                        </div>
                        <span className={`text-sm font-semibold px-4 py-1.5 rounded-full border ${statusColor(selectedApp.status || "Applied")}`}>
                          {statusDot(selectedApp.status || "Applied")} {getDisplayStatus(selectedApp.status || "Applied")}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Progress Tracker */}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-4">Application Progress</h3>
                        <div className="flex items-center justify-between">
                          {statusSteps.map((step, i) => {
                            const currentStatus = (selectedApp.status || "Applied").toUpperCase();
                            const currentIdx = getStatusIndex(selectedApp.status || "Applied");
                            const isCompleted = i <= currentIdx && currentStatus !== "REJECTED";
                            const isCurrent = statusSteps[i].toUpperCase() === currentStatus;
                            const isRejected = currentStatus === "REJECTED";
                            
                            return (
                              <div key={step} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                                    isRejected && i === 0 ? "bg-red-500 text-white shadow-md" :
                                    isCompleted ? "bg-emerald-500 text-white shadow-md" :
                                    isCurrent && !isRejected ? "bg-emerald-500 text-white ring-4 ring-emerald-200" :
                                    "bg-slate-100 text-slate-400"
                                  }`}>
                                    {isRejected && i === 0 ? "✗" : isCompleted ? "✓" : i + 1}
                                  </div>
                                  <span className={`text-[9px] mt-1.5 font-medium ${
                                    isCompleted || (isCurrent && !isRejected) ? "text-emerald-600" : "text-slate-400"
                                  }`}>
                                    {step}
                                  </span>
                                </div>
                                {i < statusSteps.length - 1 && (
                                  <div className={`flex-1 h-1 mx-2 rounded-full ${
                                    i < currentIdx && currentStatus !== "REJECTED" ? "bg-emerald-500" : "bg-slate-100"
                                  }`}></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Job Details */}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Job Details</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-[9px] text-slate-400 uppercase font-semibold">Student</p>
                            <p className="text-sm font-medium text-slate-700 mt-1">{selectedApp.studentName || user?.fullName || "Student"}</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-[9px] text-slate-400 uppercase font-semibold">College</p>
                            <p className="text-sm font-medium text-slate-700 mt-1">{selectedApp.college || user?.college || "Not specified"}</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-[9px] text-slate-400 uppercase font-semibold">Department</p>
                            <p className="text-sm font-medium text-slate-700 mt-1">{selectedApp.department || user?.department || "Not specified"}</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-[9px] text-slate-400 uppercase font-semibold">Resume</p>
                            <p className="text-sm font-medium text-emerald-600 mt-1 flex items-center gap-1">
                              <span>📄</span> {selectedApp.resume ? "Uploaded" : "Not uploaded"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Match Score (if available) */}
                      {selectedApp.matchScore && (
                        <div>
                          <h3 className="text-sm font-semibold text-slate-700 mb-2">Match Score</h3>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full progress-bar"
                                style={{ width: `${selectedApp.matchScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-emerald-600">{selectedApp.matchScore}%</span>
                          </div>
                        </div>
                      )}

                      {/* Rejected Message */}
                      {(selectedApp.status === "Rejected" || selectedApp.status === "REJECTED") && (
                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-center">
                          <span className="text-2xl block mb-1">😔</span>
                          <p className="text-sm font-semibold text-rose-700">Application Not Selected</p>
                          <p className="text-xs text-rose-600 mt-1">Don't give up! Keep applying to other opportunities.</p>
                        </div>
                      )}

                      {/* Hired Message */}
                      {(selectedApp.status === "Hired" || selectedApp.status === "HIRED") && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                          <span className="text-2xl block mb-1">🎉</span>
                          <p className="text-sm font-semibold text-emerald-700">Congratulations! You're Hired!</p>
                          <p className="text-xs text-emerald-600 mt-1">The employer will contact you with next steps.</p>
                        </div>
                      )}

                      {/* Interview Message */}
                      {(selectedApp.status === "Interview" || selectedApp.status === "INTERVIEW") && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                          <span className="text-2xl block mb-1">🎯</span>
                          <p className="text-sm font-semibold text-purple-700">Interview Scheduled!</p>
                          <p className="text-xs text-purple-600 mt-1">Check your email for interview details.</p>
                        </div>
                      )}

                      {/* Shortlisted Message */}
                      {(selectedApp.status === "Shortlisted" || selectedApp.status === "SHORTLISTED") && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                          <span className="text-2xl block mb-1">⭐</span>
                          <p className="text-sm font-semibold text-amber-700">Congratulations! You're Shortlisted!</p>
                          <p className="text-xs text-amber-600 mt-1">The employer will contact you for the next round.</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-50 border-t border-slate-100 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Application ID: {selectedApp.id?.slice(0, 8)}...</span>
                        <button 
                          onClick={() => navigate("/student/jobs")}
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition"
                        >
                          Browse More Jobs →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}