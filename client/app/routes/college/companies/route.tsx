import { useState, useEffect } from "react";

export default function CollegeCompanies() {
  var [jobs, setJobs] = useState<any[]>([]);
  var [loading, setLoading] = useState(true);
  var [filter, setFilter] = useState("pending");
  var [selectedJob, setSelectedJob] = useState<any>(null);
  var [toast, setToast] = useState<{show: boolean, message: string, type: string}>({ show: false, message: "", type: "" });
  var [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });

  useEffect(function() { loadJobs(); }, []);

  var showToast = function(message: string, type: string = "success") {
    setToast({ show: true, message: message, type: type });
    setTimeout(function() { setToast({ show: false, message: "", type: "" }); }, 3000);
  };

  var loadJobs = async function() {
    var token = localStorage.getItem("token");
    var res = await fetch("http://localhost:5000/api/jobs/all", {
      headers: { Authorization: "Bearer " + token }
    });
    if (res.ok) {
      var data = (await res.json()).jobs || [];
      setJobs(data);
      
      var pending = data.filter(function(j: any) { return j.status === "pending"; }).length;
      var approved = data.filter(function(j: any) { return j.status === "approved"; }).length;
      var rejected = data.filter(function(j: any) { return j.status === "rejected"; }).length;
      setStats({ pending: pending, approved: approved, rejected: rejected, total: data.length });
    }
    setLoading(false);
  };

  var updateStatus = async function(jobId: string, status: string) {
    var token = localStorage.getItem("token");
    try {
      var res = await fetch("http://localhost:5000/api/jobs/" + jobId + "/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ status: status })
      });
      
      if (res.ok) {
        showToast(`Job ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'moved to pending'} successfully!`, "success");
        loadJobs();
        setSelectedJob(null);
      } else {
        showToast("Failed to update job status", "error");
      }
    } catch (err) {
      showToast("Error updating job status", "error");
    }
  };

  var filteredJobs = function() {
    if (filter === "all") return jobs;
    if (filter === "pending") return jobs.filter(function(j: any) { return j.status === "pending"; });
    if (filter === "approved") return jobs.filter(function(j: any) { return j.status === "approved"; });
    if (filter === "rejected") return jobs.filter(function(j: any) { return j.status === "rejected"; });
    return jobs;
  }();

  var getStatusBadge = function(status: string) {
    switch(status) {
      case "approved":
        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "✅", label: "Approved" };
      case "rejected":
        return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "❌", label: "Rejected" };
      default:
        return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "⏳", label: "Pending" };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="flex gap-3">
          <div className="w-4 h-4 rounded-full bg-emerald-500 animate-bounce"></div>
          <div className="w-4 h-4 rounded-full bg-emerald-500 animate-bounce" style={{animationDelay:"0.15s"}}></div>
          <div className="w-4 h-4 rounded-full bg-emerald-500 animate-bounce" style={{animationDelay:"0.3s"}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-6" style={{fontFamily:"'Inter',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn { from{transform:scale(0.95);opacity:0} to{transform:scale(1);opacity:1} }
        .animate-fade-in { animation: fadeInUp 0.4s ease-out; }
        .animate-scale { animation: scaleIn 0.2s ease-out; }
        .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -12px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.02); }
      `}</style>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-scale">
          <div className={"rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-3 border-l-4 " + 
            (toast.type === "success" ? "bg-emerald-50 border-emerald-500" : "bg-red-50 border-red-500")}>
            <span className="text-2xl">{toast.type === "success" ? "✅" : "⚠️"}</span>
            <p className="font-semibold text-slate-800">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent" style={{fontFamily:"'Syne',sans-serif"}}>
                🏢 Job Approval Dashboard
              </h1>
              <p className="text-slate-500 mt-2">Review, approve, and manage employer job postings</p>
            </div>
            <button onClick={loadJobs} className="px-5 py-2.5 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex items-center gap-2 text-slate-600 font-medium">
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8 animate-fade-in" style={{animationDelay:"0.1s"}}>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Jobs</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">📋</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Pending Approval</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-1">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl">⏳</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Approved</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-1">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl">✅</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Rejected</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-1">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-2xl">❌</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6 animate-fade-in" style={{animationDelay:"0.2s"}}>
          {[
            { id: "pending", label: "⏳ Pending Approval", count: stats.pending },
            { id: "approved", label: "✅ Approved", count: stats.approved },
            { id: "rejected", label: "❌ Rejected", count: stats.rejected },
            { id: "all", label: "📋 All Jobs", count: stats.total }
          ].map(function(tab) {
            var isActive = filter === tab.id;
            return (
              <button key={tab.id} onClick={function(){setFilter(tab.id)}}
                className={"px-6 py-2.5 rounded-xl text-sm font-bold transition-all " + 
                  (isActive ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:shadow-md")}>
                {tab.label} <span className={"ml-2 px-2 py-0.5 rounded-full text-xs " + (isActive ? "bg-white/20" : "bg-slate-100")}>{tab.count}</span>
              </button>
            );
          })}
        </div>

        {/* Job Cards Grid */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center animate-fade-in">
            <div className="w-24 h-24 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4 text-5xl">📋</div>
            <p className="text-slate-500 text-lg font-medium">No jobs to display</p>
            <p className="text-slate-400 text-sm mt-1">Jobs from employers will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map(function(job: any, i: number) {
              var statusInfo = getStatusBadge(job.status);
              var isPending = job.status === "pending";
              
              return (
                <div key={job.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden card-hover cursor-pointer animate-fade-in"
                  style={{animationDelay:(i*0.05)+"s"}}
                  onClick={function(){setSelectedJob(job)}}>
                  
                  <div className="p-5 border-b border-slate-100">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {job.company?.charAt(0) || "C"}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">{job.title}</h3>
                          <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                            🏢 {job.company}
                          </p>
                        </div>
                      </div>
                      <div className={"px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 " + statusInfo.bg + " " + statusInfo.text + " " + statusInfo.border}>
                        {statusInfo.icon} {statusInfo.label}
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">📍 {job.location}</div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">💼 {job.type}</div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">💰 ₹{job.salaryMin/100000}L - ₹{job.salaryMax/100000}L</div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">👥 {job.applications?.length || 0} applied</div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.skills?.split(',').slice(0, 3).map(function(skill: string) {
                        return <span key={skill} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-lg font-medium">🔧 {skill.trim()}</span>;
                      })}
                      {job.skills?.split(',').length > 3 && <span className="px-2.5 py-1 bg-slate-50 text-slate-600 text-xs rounded-lg">+{job.skills.split(',').length-3} more</span>}
                    </div>

                    <p className="text-sm text-slate-500 line-clamp-2">{job.description}</p>

                    {isPending && (
                      <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100" onClick={function(e: any){e.stopPropagation()}}>
                        <button onClick={function(){updateStatus(job.id, "approved")}}
                          className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                          ✅ Approve Job
                        </button>
                        <button onClick={function(){updateStatus(job.id, "rejected")}}
                          className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                          ❌ Reject
                        </button>
                      </div>
                    )}

                    {!isPending && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className={"text-sm font-medium text-center " + (job.status === "approved" ? "text-emerald-600" : "text-red-600")}>
                          {job.status === "approved" ? "✅ This job is visible to students" : "❌ This job has been rejected"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Job Detail Modal with UNDO */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={function(){setSelectedJob(null)}}>
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale" onClick={function(e: any){e.stopPropagation()}}>
            
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 p-6 rounded-t-3xl">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {selectedJob.company?.charAt(0) || "C"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">{selectedJob.title}</h2>
                    <p className="text-slate-500 text-sm mt-1">🏢 {selectedJob.company} • 📍 {selectedJob.location}</p>
                  </div>
                </div>
                <button onClick={function(){setSelectedJob(null)}} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all text-slate-500 text-xl">✕</button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 text-center">
                  <p className="text-lg font-bold text-emerald-700">₹{selectedJob.salaryMin/100000}L - ₹{selectedJob.salaryMax/100000}L</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">💰 Salary Range</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
                  <p className="text-lg font-bold text-blue-700">{selectedJob.type}</p>
                  <p className="text-xs text-blue-600 font-medium mt-1">💼 Job Type</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 text-center">
                  <p className="text-lg font-bold text-amber-700">{new Date(selectedJob.deadline).toLocaleDateString()}</p>
                  <p className="text-xs text-amber-600 font-medium mt-1">📅 Deadline</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center">
                  <p className="text-lg font-bold text-purple-700">{selectedJob.applications?.length || 0}</p>
                  <p className="text-xs text-purple-600 font-medium mt-1">👥 Applications</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">📝 Job Description</h3>
                <p className="text-slate-600 leading-relaxed">{selectedJob.description}</p>
              </div>

              {selectedJob.requirements && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">📋 Requirements</h3>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">{selectedJob.requirements}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">🛠️ Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills?.split(',').map(function(skill: string) {
                    return <span key={skill} className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-700">🔧 {skill.trim()}</span>;
                  })}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-2">👤 Posted by</h3>
                <p className="text-slate-700">{selectedJob.postedByUser?.fullName || "Unknown"}</p>
                <p className="text-sm text-slate-500">{selectedJob.postedByUser?.email}</p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                {selectedJob.status === "pending" ? (
                  <div className="flex gap-3">
                    <button onClick={function(){updateStatus(selectedJob.id, "approved")}}
                      className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-base font-bold rounded-2xl hover:shadow-xl transition-all flex items-center justify-center gap-2">
                      ✅ Approve Job
                    </button>
                    <button onClick={function(){updateStatus(selectedJob.id, "rejected")}}
                      className="flex-1 py-4 bg-gradient-to-r from-red-500 to-rose-500 text-white text-base font-bold rounded-2xl hover:shadow-xl transition-all flex items-center justify-center gap-2">
                      ❌ Reject
                    </button>
                  </div>
                ) : selectedJob.status === "approved" ? (
                  <div>
                    <button onClick={function(){updateStatus(selectedJob.id, "pending")}}
                      className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white text-base font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
                      🔄 UNDO - Move Back to Pending
                    </button>
                    <p className="text-center text-sm text-emerald-600 mt-3">✅ This job is currently approved and visible to students</p>
                  </div>
                ) : (
                  <div>
                    <button onClick={function(){updateStatus(selectedJob.id, "pending")}}
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-base font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
                      🔄 Reconsider - Move to Pending
                    </button>
                    <p className="text-center text-sm text-red-600 mt-3">❌ This job is currently rejected</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}