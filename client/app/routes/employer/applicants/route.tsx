import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function EmployerApplicants() {
  var navigate = useNavigate();
  var [jobs, setJobs] = useState<any[]>([]);
  var [selectedJob, setSelectedJob] = useState<any>(null);
  var [applicants, setApplicants] = useState<any[]>([]);
  var [loading, setLoading] = useState(true);
  var [updating, setUpdating] = useState<string | null>(null);

  useEffect(function() { loadJobs(); }, []);

  var loadJobs = async function() {
    var token = localStorage.getItem("token");
    var res = await fetch("http://localhost:5000/api/jobs/employer", {
      headers: { Authorization: "Bearer " + token }
    });
    if (res.ok) {
      var data = await res.json();
      setJobs(data.jobs || []);
      if (data.jobs?.length > 0) {
        setSelectedJob(data.jobs[0]);
        loadApplicants(data.jobs[0].id);
      }
    }
    setLoading(false);
  };

  var loadApplicants = async function(jobId: string) {
    var token = localStorage.getItem("token");
    var res = await fetch("http://localhost:5000/api/applications/job/" + jobId, {
      headers: { Authorization: "Bearer " + token }
    });
    if (res.ok) {
      var data = await res.json();
      setApplicants(data.applications || []);
    }
  };

  var updateStatus = async function(appId: string, status: string) {
    setUpdating(appId);
    var token = localStorage.getItem("token");
    try {
      await fetch("http://localhost:5000/api/applications/" + appId + "/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ status: status })
      });
      if (selectedJob) loadApplicants(selectedJob.id);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  var getStatusBadge = function(status: string) {
    switch(status) {
      case "Shortlisted": return { bg: "bg-amber-500", text: "text-white", border: "border-amber-600", icon: "⭐", label: "Shortlisted" };
      case "Interview": return { bg: "bg-purple-600", text: "text-white", border: "border-purple-700", icon: "🎯", label: "Interview" };
      case "HIRED": return { bg: "bg-emerald-600", text: "text-white", border: "border-emerald-700", icon: "✅", label: "Hired" };
      case "Rejected": return { bg: "bg-red-600", text: "text-white", border: "border-red-700", icon: "❌", label: "Rejected" };
      default: return { bg: "bg-blue-600", text: "text-white", border: "border-blue-700", icon: "📝", label: "Applied" };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-indigo-50/30">
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
          transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          position: relative;
          overflow: hidden;
        }
        
        .applicant-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.2);
        }
        
        .applicant-card-applied { border-left: 5px solid #2563eb; border-radius: 16px; }
        .applicant-card-shortlisted { border-left: 5px solid #d97706; border-radius: 16px; background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%); }
        .applicant-card-interview { border-left: 5px solid #7c3aed; border-radius: 16px; background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%); }
        .applicant-card-hired { border-left: 5px solid #059669; border-radius: 16px; background: linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%); }
        .applicant-card-rejected { border-left: 5px solid #dc2626; border-radius: 16px; opacity: 0.85; background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%); }
        
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
          transform: translateY(-1px);
        }
        
        .status-btn {
          transition: all 0.2s ease;
          font-weight: 600;
        }
        
        .status-btn-shortlist { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
        .status-btn-shortlist:hover { background: #d97706; color: white; transform: scale(1.02); box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3); }
        
        .status-btn-interview { background: #f3e8ff; color: #7c3aed; border: 1px solid #d8b4fe; }
        .status-btn-interview:hover { background: #7c3aed; color: white; transform: scale(1.02); box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3); }
        
        .status-btn-hire { background: #d1fae5; color: #059669; border: 1px solid #a7f3d0; }
        .status-btn-hire:hover { background: #059669; color: white; transform: scale(1.02); box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); }
        
        .status-btn-reject { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
        .status-btn-reject:hover { background: #dc2626; color: white; transform: scale(1.02); box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3); }
        
        .stat-card {
          transition: all 0.2s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
        }
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 10px; }
      `}</style>

      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <span className="text-base">👥</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Inter', sans-serif" }}>
                Applicants
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">Review and manage job applications</p>
            </div>
          </div>
        </div>

        {/* Job Selector Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 flex-wrap">
          {jobs.map(function(job: any) {
            var isActive = selectedJob?.id === job.id;
            var appCount = job.applications?.length || 0;
            return (
              <button 
                key={job.id} 
                onClick={function(){ setSelectedJob(job); loadApplicants(job.id); }}
                className={`job-tab px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive ? "job-tab-active" : "job-tab-inactive"
                }`}
              >
                <span className="text-sm">💼</span>
                {job.title}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {appCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Applicants List */}
        {selectedJob && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {selectedJob.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  <span className="font-semibold text-indigo-600 text-sm">{applicants.length}</span> applicants for this position
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded-full">📅 Deadline: {new Date(selectedJob.deadline).toLocaleDateString()}</span>
              </div>
            </div>

            {applicants.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-dashed border-indigo-300 p-10 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">👥</span>
                </div>
                <p className="text-slate-600 text-sm font-medium">No applicants yet</p>
                <p className="text-slate-400 text-xs mt-1">Applications will appear here when students apply</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applicants.map(function(app: any, i: number) {
                  var statusInfo = getStatusBadge(app.status);
                  var isUpdating = updating === app.id;
                  var cardClass = "";
                  if (app.status === "Shortlisted") cardClass = "applicant-card-shortlisted";
                  else if (app.status === "Interview") cardClass = "applicant-card-interview";
                  else if (app.status === "HIRED") cardClass = "applicant-card-hired";
                  else if (app.status === "Rejected") cardClass = "applicant-card-rejected";
                  else cardClass = "applicant-card-applied";
                  
                  return (
                    <div key={app.id} className={`applicant-card bg-white rounded-xl border border-slate-200 p-4 shadow-sm ${cardClass}`} style={{ animationDelay: `${i * 0.05}s` }}>
                      {/* Status Ribbon - Top Right */}
                      <div className="absolute top-0 right-0">
                        <div className={`text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl ${statusInfo.bg} ${statusInfo.text} shadow-sm`}>
                          {statusInfo.icon} {statusInfo.label}
                        </div>
                      </div>
                      
                      <div className="flex items-start justify-between flex-wrap gap-3 pr-20">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                              {app.studentName?.charAt(0) || app.student?.fullName?.charAt(0) || "S"}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 text-sm">
                              {app.studentName || app.student?.fullName || "Student"}
                            </h3>
                            <p className="text-xs text-slate-500">
                              {app.studentEmail || app.student?.email || "email@example.com"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                                🏛️ {app.college || app.student?.college || "College"}
                              </span>
                              <span className="text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                                📚 {app.department || app.student?.department || "Department"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-3 border-t-2 border-slate-200">
                        <div className="stat-card bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-2 text-center border border-indigo-200 shadow-sm">
                          <p className="text-lg font-bold text-indigo-700">{app.matchScore || 85}%</p>
                          <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-wide">Match</p>
                        </div>
                        <div className="stat-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-2 text-center border border-emerald-200 shadow-sm">
                          <p className="text-xs font-bold text-emerald-700">{new Date(app.appliedAt).toLocaleDateString()}</p>
                          <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wide">Applied</p>
                        </div>
                        <div className="stat-card bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-2 text-center border border-amber-200 shadow-sm">
                          <p className="text-xs font-bold text-amber-700 flex items-center justify-center gap-1">
                            <span className="text-sm">📄</span> {app.resume ? "Yes" : "No"}
                          </p>
                          <p className="text-[9px] text-amber-600 font-bold uppercase tracking-wide">Resume</p>
                        </div>
                        <div className="stat-card bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-2 text-center border border-purple-200 shadow-sm">
                          <p className="text-xs font-bold text-purple-700">{app.interviewDate ? "Scheduled" : "Pending"}</p>
                          <p className="text-[9px] text-purple-600 font-bold uppercase tracking-wide">Interview</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-3 pt-2">
                        {app.resume && (
                          <button className="status-btn px-3 py-1.5 text-[10px] font-semibold text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all border border-indigo-200">
                            📄 Resume
                          </button>
                        )}
                        <button 
                          onClick={() => updateStatus(app.id, "Shortlisted")}
                          disabled={isUpdating}
                          className="status-btn status-btn-shortlist flex-1 py-1.5 text-[10px] font-semibold rounded-lg transition-all disabled:opacity-50"
                        >
                          ⭐ Shortlist
                        </button>
                        <button 
                          onClick={() => updateStatus(app.id, "Interview")}
                          disabled={isUpdating}
                          className="status-btn status-btn-interview flex-1 py-1.5 text-[10px] font-semibold rounded-lg transition-all disabled:opacity-50"
                        >
                          🎯 Interview
                        </button>
                        <button 
                          onClick={() => updateStatus(app.id, "HIRED")}
                          disabled={isUpdating}
                          className="status-btn status-btn-hire flex-1 py-1.5 text-[10px] font-semibold rounded-lg transition-all disabled:opacity-50"
                        >
                          ✅ Hire
                        </button>
                        <button 
                          onClick={() => updateStatus(app.id, "Rejected")}
                          disabled={isUpdating}
                          className="status-btn status-btn-reject px-3 py-1.5 text-[10px] font-semibold rounded-lg transition-all disabled:opacity-50"
                        >
                          ❌
                        </button>
                      </div>
                      
                      {/* Updating Indicator */}
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
      </div>
    </div>
  );
}