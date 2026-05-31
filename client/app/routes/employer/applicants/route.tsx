import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function EmployerApplicants() {
  var navigate = useNavigate();
  var [jobs, setJobs] = useState<any[]>([]);
  var [selectedJob, setSelectedJob] = useState<any>(null);
  var [applicants, setApplicants] = useState<any[]>([]);
  var [loading, setLoading] = useState(true);
  var [updating, setUpdating] = useState<string | null>(null);
  var [searchTerm, setSearchTerm] = useState("");
  var [statusFilter, setStatusFilter] = useState("all");
  var [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  useEffect(function() { loadJobs(); }, []);

  var showToast = function(message: string, type: string) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  var loadJobs = async function() {
    setLoading(true);
    var token = localStorage.getItem("token");
    try {
      // ✅ CORRECT ENDPOINT: /api/jobs/my-jobs
      var res = await fetch("http://localhost:5000/api/jobs/my-jobs", {
        headers: { Authorization: "Bearer " + token }
      });
      
      if (res.ok) {
        var data = await res.json();
        var jobsList = data.jobs || [];
        setJobs(jobsList);
        
        if (jobsList.length > 0) {
          setSelectedJob(jobsList[0]);
          loadApplicants(jobsList[0].id);
        }
      } else {
        console.error("Failed to load jobs:", res.status);
        showToast("Failed to load jobs", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  var loadApplicants = async function(jobId: string) {
    var token = localStorage.getItem("token");
    try {
      // ✅ CORRECT ENDPOINT: /api/applications/job/:jobId
      var res = await fetch(`http://localhost:5000/api/applications/job/${jobId}`, {
        headers: { Authorization: "Bearer " + token }
      });
      
      if (res.ok) {
        var data = await res.json();
        var appsList = data.applications || [];
        setApplicants(appsList);
        console.log(`Loaded ${appsList.length} applicants for job ${jobId}`);
      } else {
        console.error("Failed to load applicants:", res.status);
        setApplicants([]);
      }
    } catch (err) {
      console.error(err);
      setApplicants([]);
    }
  };

  var updateStatus = async function(appId: string, status: string) {
    setUpdating(appId);
    var token = localStorage.getItem("token");
    try {
      // ✅ CORRECT ENDPOINT: /api/applications/:id/status
      var res = await fetch(`http://localhost:5000/api/applications/${appId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ status: status })
      });
      
      if (res.ok) {
        showToast(`Application ${status.toLowerCase()} successfully!`, "success");
        if (selectedJob) loadApplicants(selectedJob.id);
      } else {
        var error = await res.json();
        showToast(error.error || "Failed to update status", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    } finally {
      setUpdating(null);
    }
  };

  var downloadResume = async (app: any) => {
    if (!app.resume) {
      showToast("No resume uploaded", "error");
      return;
    }
    
    var token = localStorage.getItem("token");
    try {
      var res = await fetch(`http://localhost:5000/api/applications/${app.id}/resume`, {
        headers: { Authorization: "Bearer " + token }
      });
      
      if (res.ok) {
        var blob = await res.blob();
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = app.resumeFileName || 'resume.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast("Resume downloaded", "success");
      } else {
        showToast("Failed to download resume", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Download failed", "error");
    }
  };

  var getStatusBadge = function(status: string) {
    switch(status) {
      case "Shortlisted": return { bg: "bg-amber-500", text: "text-white", icon: "⭐", label: "Shortlisted" };
      case "Interview": return { bg: "bg-purple-600", text: "text-white", icon: "🎯", label: "Interview" };
      case "HIRED": return { bg: "bg-emerald-600", text: "text-white", icon: "✅", label: "Hired" };
      case "Rejected": return { bg: "bg-red-600", text: "text-white", icon: "❌", label: "Rejected" };
      default: return { bg: "bg-blue-600", text: "text-white", icon: "📝", label: "Applied" };
    }
  };

  var filteredApplicants = applicants.filter(function(app) {
    if (statusFilter !== "all" && app.status !== statusFilter) return false;
    if (searchTerm) {
      var name = (app.studentName || app.student?.fullName || "").toLowerCase();
      var email = (app.studentEmail || app.student?.email || "").toLowerCase();
      return name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay:"0.15s"}}></div>
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay:"0.3s"}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .applicant-card {
          animation: fadeSlide 0.3s ease both;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .applicant-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.15);
        }
        
        .applicant-card-applied { border-left: 4px solid #3b82f6; border-radius: 16px; }
        .applicant-card-shortlisted { border-left: 4px solid #f59e0b; border-radius: 16px; background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%); }
        .applicant-card-interview { border-left: 4px solid #8b5cf6; border-radius: 16px; background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%); }
        .applicant-card-hired { border-left: 4px solid #10b981; border-radius: 16px; background: linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%); }
        
        .job-tab-active {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
        }
        
        .job-tab-inactive {
          background: white;
          color: #4b5563;
          border: 1px solid #e5e7eb;
        }
        
        .job-tab-inactive:hover {
          background: #f5f3ff;
          border-color: #8b5cf6;
          color: #7c3aed;
        }
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 10px; }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
            <span>{toast.type === "success" ? "✅" : "❌"}</span>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <span className="text-base">👥</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Applicants</h1>
              <p className="text-xs text-slate-500 mt-0.5">Review and manage job applications</p>
            </div>
          </div>
        </div>

        {/* Job Selector Tabs */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-indigo-300 p-10 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">📋</span>
            </div>
            <p className="text-slate-600 text-sm font-medium">No jobs found</p>
            <p className="text-slate-400 text-xs mt-1">Post a job to start receiving applications</p>
            <button onClick={() => navigate("/employer/jobs/new")} className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition">
              + Post a Job
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 flex-wrap">
              {jobs.map(function(job: any) {
                var isActive = selectedJob?.id === job.id;
                return (
                  <button 
                    key={job.id} 
                    onClick={function(){ setSelectedJob(job); loadApplicants(job.id); }}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                      isActive ? "job-tab-active" : "job-tab-inactive"
                    }`}
                  >
                    <span className="text-sm">💼</span>
                    {job.title}
                  </button>
                );
              })}
            </div>

            {/* Applicants List */}
            {selectedJob && (
              <div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{selectedJob.title}</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      <span className="font-semibold text-indigo-600 text-sm">{filteredApplicants.length}</span> applicants for this position
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="🔍 Search applicants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg w-48 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="all">All Status</option>
                      <option value="Applied">📝 Applied</option>
                      <option value="Shortlisted">⭐ Shortlisted</option>
                      <option value="Interview">🎯 Interview</option>
                      <option value="HIRED">✅ Hired</option>
                      <option value="Rejected">❌ Rejected</option>
                    </select>
                  </div>
                </div>

                {filteredApplicants.length === 0 ? (
                  <div className="bg-white rounded-xl border-2 border-dashed border-indigo-300 p-10 text-center shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">👥</span>
                    </div>
                    <p className="text-slate-600 text-sm font-medium">No applicants yet</p>
                    <p className="text-slate-400 text-xs mt-1">Applications will appear here when students apply</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredApplicants.map(function(app: any, i: number) {
                      var statusInfo = getStatusBadge(app.status);
                      var isUpdating = updating === app.id;
                      var studentName = app.studentName || app.student?.fullName || "Student";
                      var studentEmail = app.studentEmail || app.student?.email || "";
                      var college = app.college || app.student?.college || "College";
                      var department = app.department || app.student?.department || "Department";
                      var matchScore = app.matchScore || 75;
                      
                      var cardClass = "";
                      if (app.status === "Shortlisted") cardClass = "applicant-card-shortlisted";
                      else if (app.status === "Interview") cardClass = "applicant-card-interview";
                      else if (app.status === "HIRED") cardClass = "applicant-card-hired";
                      else cardClass = "applicant-card-applied";
                      
                      return (
                        <div key={app.id} className={`applicant-card bg-white rounded-xl border border-slate-200 p-4 shadow-sm ${cardClass}`}>
                          <div className="absolute top-0 right-0">
                            <div className={`text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl ${statusInfo.bg} ${statusInfo.text} shadow-sm`}>
                              {statusInfo.icon} {statusInfo.label}
                            </div>
                          </div>
                          
                          <div className="flex items-start justify-between flex-wrap gap-3 pr-24">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                                  {studentName.charAt(0)}
                                </div>
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-800 text-sm">{studentName}</h3>
                                <p className="text-xs text-slate-500">{studentEmail}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">🏛️ {college?.split(',')[0]}</span>
                                  <span className="text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">📚 {department}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t-2 border-slate-200">
                            <div className="bg-indigo-50 rounded-lg p-2 text-center">
                              <p className="text-lg font-bold text-indigo-700">{matchScore}%</p>
                              <p className="text-[8px] text-indigo-600 font-bold">Match</p>
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-2 text-center">
                              <p className="text-xs font-bold text-emerald-700">{new Date(app.appliedAt).toLocaleDateString()}</p>
                              <p className="text-[8px] text-emerald-600 font-bold">Applied</p>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-2 text-center">
                              <p className="text-xs font-bold text-amber-700">📄 {app.resume ? "Yes" : "No"}</p>
                              <p className="text-[8px] text-amber-600 font-bold">Resume</p>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-3 pt-2">
                            {app.resume && (
                              <button onClick={() => downloadResume(app)} className="px-3 py-1.5 text-[10px] font-semibold text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all">
                                📄 Resume
                              </button>
                            )}
                            <button 
                              onClick={() => updateStatus(app.id, "Shortlisted")}
                              disabled={isUpdating}
                              className="flex-1 py-1.5 text-[10px] font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white transition-all disabled:opacity-50"
                            >
                              ⭐ Shortlist
                            </button>
                            <button 
                              onClick={() => updateStatus(app.id, "Interview")}
                              disabled={isUpdating}
                              className="flex-1 py-1.5 text-[10px] font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-500 hover:text-white transition-all disabled:opacity-50"
                            >
                              🎯 Interview
                            </button>
                            <button 
                              onClick={() => updateStatus(app.id, "HIRED")}
                              disabled={isUpdating}
                              className="flex-1 py-1.5 text-[10px] font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                            >
                              ✅ Hire
                            </button>
                            <button 
                              onClick={() => updateStatus(app.id, "Rejected")}
                              disabled={isUpdating}
                              className="px-3 py-1.5 text-[10px] font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                            >
                              ❌
                            </button>
                          </div>
                          
                          {isUpdating && (
                            <div className="mt-1 text-center">
                              <span className="text-[9px] text-indigo-600 font-semibold animate-pulse">Updating...</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}