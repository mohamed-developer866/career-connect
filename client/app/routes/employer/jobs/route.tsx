import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function MyJobs() {
  var navigate = useNavigate();
  var [jobs, setJobs] = useState<any[]>([]);
  var [loading, setLoading] = useState(true);
  var [selectedJob, setSelectedJob] = useState<any>(null);
  var [filter, setFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");

  useEffect(function() { loadJobs(); }, []);

  var loadJobs = async function() {
    var token = localStorage.getItem("token");
    var res = await fetch("http://localhost:5000/api/jobs/employer", {
      headers: { Authorization: "Bearer " + token }
    });
    if (res.ok) {
      var data = await res.json();
      setJobs(data.jobs || []);
    }
    setLoading(false);
  };

  var deleteJob = async function(id: string) {
    if (!confirm("Delete this job?")) return;
    var token = localStorage.getItem("token");
    await fetch("http://localhost:5000/api/jobs/" + id, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    });
    setSelectedJob(null);
    loadJobs();
  };

  var filteredJobs = jobs.filter(job => {
    if (filter === "all") return true;
    return job.status === filter;
  });

  var getStatusColor = function(status: string) {
    switch(status) {
      case "approved": return { bg: "bg-emerald-600", text: "text-white", icon: "✅", label: "Approved" };
      case "pending": return { bg: "bg-amber-500", text: "text-white", icon: "⏳", label: "Pending" };
      case "rejected": return { bg: "bg-red-600", text: "text-white", icon: "❌", label: "Rejected" };
      default: return { bg: "bg-gray-500", text: "text-white", icon: "📋", label: "Draft" };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 animate-spin" style={{animationDuration: '2s'}}></div>
            <div className="absolute inset-1 rounded-lg bg-white flex items-center justify-center">
              <span className="text-xl">💼</span>
            </div>
          </div>
          <p className="text-indigo-600 font-medium text-sm animate-pulse">Loading Jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .slide-up { animation: slideUp 0.3s ease both; }
        .job-card { transition: all 0.2s cubic-bezier(0.2, 0.9, 0.4, 1.1); }
        .job-card:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -12px rgba(0, 0, 0, 0.12); }
        
        .job-card-approved { border-left: 3px solid #059669; }
        .job-card-pending { border-left: 3px solid #d97706; }
        .job-card-rejected { border-left: 3px solid #dc2626; }
        
        .filter-active {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
        }
        
        .filter-inactive {
          background: white;
          color: #4b5563;
          border: 1px solid #e5e7eb;
        }
        
        .filter-inactive:hover {
          background: #f5f3ff;
          border-color: #8b5cf6;
          color: #7c3aed;
        }
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>

      <div className="max-w-7xl mx-auto px-5 py-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5 slide-up">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-lg">💼</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Syne', sans-serif" }}>
                My Jobs
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">{jobs.length} jobs posted • {jobs.filter(j => j.status === 'approved').length} active</p>
            </div>
          </div>
          <button onClick={() => navigate("/employer/jobs/new")}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold rounded-lg hover:shadow-md transition-all flex items-center gap-1.5">
            <span className="text-base">+</span> Post New Job
          </button>
        </div>

        {/* FILTER TABS */}
        <div className="flex gap-2 mb-5 slide-up">
          {[
            { id: "all", label: "All", icon: "📋", count: jobs.length },
            { id: "approved", label: "Approved", icon: "✅", count: jobs.filter(j => j.status === 'approved').length },
            { id: "pending", label: "Pending", icon: "⏳", count: jobs.filter(j => j.status === 'pending').length },
            { id: "rejected", label: "Rejected", icon: "❌", count: jobs.filter(j => j.status === 'rejected').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1.5 ${
                filter === tab.id
                  ? "filter-active"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {tab.icon} {tab.label}
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                filter === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* JOBS LIST */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-indigo-200 p-8 text-center slide-up">
            <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📋</span>
            </div>
            <h2 className="text-base font-bold text-slate-700 mb-1">No Jobs Found</h2>
            <p className="text-xs text-slate-400 mb-3">
              {filter === "all" ? "You haven't posted any jobs yet" : `No ${filter} jobs found`}
            </p>
            {filter === "all" && (
              <button onClick={() => navigate("/employer/jobs/new")}
                className="px-4 py-1.5 bg-indigo-500 text-white text-xs font-semibold rounded-lg hover:bg-indigo-600 transition-all">
                Post Your First Job
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredJobs.map(function(job: any, i: number) {
              var apps = job.applications || [];
              var shortlisted = apps.filter(function(a: any) { return a.status === 'Shortlisted'; }).length;
              var hired = apps.filter(function(a: any) { return a.status === 'HIRED'; }).length;
              var statusInfo = getStatusColor(job.status);
              var daysLeft = Math.ceil((new Date(job.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              var cardClass = job.status === "approved" ? "job-card-approved" : job.status === "pending" ? "job-card-pending" : job.status === "rejected" ? "job-card-rejected" : "";
              
              return (
                <div key={job.id} className={`job-card bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden cursor-pointer group ${cardClass}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => setSelectedJob(job)}>
                  
                  {/* Card Header - Smaller */}
                  <div className="p-3 border-b border-slate-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm shadow-sm flex-shrink-0">
                          {job.company?.charAt(0) || "C"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 text-sm line-clamp-1">{job.title}</h3>
                          <p className="text-[9px] text-slate-500">{job.company} • {job.location}</p>
                        </div>
                      </div>
                      <div className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.text} shadow-sm flex items-center gap-1`}>
                        {statusInfo.icon} {statusInfo.label}
                      </div>
                    </div>
                  </div>

                  {/* Card Body - Smaller */}
                  <div className="p-3">
                    {/* Quick Stats - Smaller */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      <div className="text-center bg-slate-50 rounded-md p-1.5">
                        <p className="text-sm font-bold text-indigo-600">₹{(job.salaryMin/100000).toFixed(0)}L</p>
                        <p className="text-[8px] text-slate-500 font-medium uppercase">Salary</p>
                      </div>
                      <div className="text-center bg-slate-50 rounded-md p-1.5">
                        <p className="text-sm font-bold text-emerald-600">{apps.length}</p>
                        <p className="text-[8px] text-slate-500 font-medium uppercase">Applied</p>
                      </div>
                      <div className="text-center bg-slate-50 rounded-md p-1.5">
                        <p className="text-sm font-bold text-amber-600">{shortlisted}</p>
                        <p className="text-[8px] text-slate-500 font-medium uppercase">Shortlist</p>
                      </div>
                      <div className="text-center bg-slate-50 rounded-md p-1.5">
                        <p className="text-sm font-bold text-purple-600">{hired}</p>
                        <p className="text-[8px] text-slate-500 font-medium uppercase">Hired</p>
                      </div>
                    </div>

                    {/* Skills - Smaller */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(job.skills || "").split(',').slice(0, 3).map(function(skill: string) {
                        return <span key={skill} className="text-[8px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{skill.trim()}</span>;
                      })}
                      {(job.skills || "").split(',').length > 3 && (
                        <span className="text-[8px] text-slate-400">+{job.skills.split(',').length - 3}</span>
                      )}
                    </div>

                    {/* Deadline - Smaller */}
                    <div className="flex items-center justify-between text-[9px] text-slate-500 mb-3">
                      <span className="flex items-center gap-1">📅 {new Date(job.deadline).toLocaleDateString()}</span>
                      {daysLeft > 0 ? (
                        <span className={`px-1.5 py-0.5 rounded-full ${daysLeft <= 3 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                          {daysLeft} days left
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">Expired</span>
                      )}
                    </div>

                    {/* Actions - Smaller */}
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button className="flex-1 py-1.5 text-[9px] font-semibold text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-all">
                        View Applicants ({apps.length})
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteJob(job.id); }}
                        className="px-3 py-1.5 text-[9px] font-semibold text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-all">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* JOB DETAIL MODAL - Smaller */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedJob(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-base font-bold shadow-md">
                    {selectedJob.company?.charAt(0) || "C"}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">{selectedJob.title}</h2>
                    <p className="text-xs text-indigo-600 font-semibold">{selectedJob.company}</p>
                    <p className="text-[10px] text-slate-500">{selectedJob.location} • {selectedJob.type}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm">✕</button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-100 rounded-lg p-3 text-center">
                  <p className="text-sm font-bold text-indigo-700">₹{(selectedJob.salaryMin/100000).toFixed(1)}L-{(selectedJob.salaryMax/100000).toFixed(1)}L</p>
                  <p className="text-[9px] text-slate-500 font-semibold uppercase">Salary</p>
                </div>
                <div className="bg-slate-100 rounded-lg p-3 text-center">
                  <p className="text-sm font-bold text-emerald-700">{(selectedJob.applications || []).length}</p>
                  <p className="text-[9px] text-slate-500 font-semibold uppercase">Applicants</p>
                </div>
                <div className="bg-slate-100 rounded-lg p-3 text-center">
                  <p className="text-sm font-bold text-amber-700">{new Date(selectedJob.deadline).toLocaleDateString()}</p>
                  <p className="text-[9px] text-slate-500 font-semibold uppercase">Deadline</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-[10px] font-semibold text-slate-700 mb-1 uppercase">Description</h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-100 rounded-lg p-3">{selectedJob.description}</p>
              </div>

              {/* Requirements */}
              {selectedJob.requirements && (
                <div>
                  <h3 className="text-[10px] font-semibold text-slate-700 mb-1 uppercase">Requirements</h3>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-100 rounded-lg p-3 whitespace-pre-line">{selectedJob.requirements}</p>
                </div>
              )}

              {/* Skills */}
              <div>
                <h3 className="text-[10px] font-semibold text-slate-700 mb-1 uppercase">Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedJob.skills || "").split(',').map(function(skill: string) {
                    return <span key={skill} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-[9px] font-medium">{skill.trim()}</span>;
                  })}
                </div>
              </div>

              {/* Applicants List */}
              {(selectedJob.applications || []).length > 0 && (
                <div>
                  <h3 className="text-[10px] font-semibold text-slate-700 mb-1 uppercase">Recent Applicants</h3>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {(selectedJob.applications || []).slice(0, 5).map((app: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-100 rounded-lg">
                        <div>
                          <p className="text-xs font-medium text-slate-700">{app.student?.fullName || app.studentName}</p>
                          <p className="text-[9px] text-slate-500">{app.student?.email || app.studentEmail}</p>
                        </div>
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                          app.status === 'HIRED' ? 'bg-emerald-100 text-emerald-700' :
                          app.status === 'Shortlisted' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 flex gap-3">
              <button onClick={() => setSelectedJob(null)} className="flex-1 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-all">
                Close
              </button>
              <button onClick={() => deleteJob(selectedJob.id)} className="flex-1 py-2 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-all">
                Delete Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}