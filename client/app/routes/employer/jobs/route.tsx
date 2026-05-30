import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function MyJobs() {
  var navigate = useNavigate();
  var [jobs, setJobs] = useState<any[]>([]);
  var [loading, setLoading] = useState(true);
  var [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(function() { loadJobs(); }, []);

  var loadJobs = async function() {
    var token = localStorage.getItem("token");
    var res = await fetch("http://localhost:5000/api/jobs/employer", {
      headers: { Authorization: "Bearer " + token }
    });
    if (res.ok) setJobs((await res.json()).jobs || []);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 animate-spin" style={{animationDuration: '2s'}}></div>
            <div className="absolute inset-1 rounded-xl bg-white flex items-center justify-center">
              <span className="text-2xl">💼</span>
            </div>
          </div>
          <p className="text-violet-600 font-bold animate-pulse">Loading Jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        @keyframes floatIn { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { 0% { opacity: 0; transform: translateY(30px) scale(0.95); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(108,71,255,0.3); } 50% { box-shadow: 0 0 0 12px rgba(108,71,255,0); } }
        .float-in { animation: floatIn 0.5s ease both; }
        .slide-up { animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .premium-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .premium-card:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(108,71,255,0.12); border-color: #c4b5fd; }
        .gradient-text { background: linear-gradient(135deg, #7c3aed, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10 float-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-purple-200" style={{animation: 'pulseGlow 2s infinite'}}>
              <span className="text-2xl">💼</span>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900" style={{ fontFamily: "'Syne', sans-serif" }}>
                <span className="gradient-text">My Jobs</span>
              </h1>
              <p className="text-gray-500 text-sm mt-1 font-medium">{jobs.length} jobs posted</p>
            </div>
          </div>
          <button onClick={function(){navigate("/employer/jobs/new")}}
            className="px-6 py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold rounded-2xl hover:shadow-xl hover:shadow-purple-200 transition-all flex items-center gap-2">
            <span className="text-lg">+</span> Post New Job
          </button>
        </div>

        {/* JOBS LIST */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-16 text-center float-in">
            <div className="w-20 h-20 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📋</span>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>No Jobs Posted Yet</h2>
            <p className="text-gray-500 mb-6">Create your first job listing to start receiving applications</p>
            <button onClick={function(){navigate("/employer/jobs/new")}}
              className="px-8 py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold rounded-2xl hover:shadow-xl transition-all">
              🚀 Post Your First Job
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {jobs.map(function(job: any, i: number) {
              var apps = job.applications || [];
              var shortlisted = apps.filter(function(a: any) { return a.status === 'Shortlisted'; }).length;
              var hired = apps.filter(function(a: any) { return a.status === 'Selected'; }).length;
              return (
                <div key={job.id} className="premium-card slide-up bg-white rounded-2xl border-2 border-gray-100 p-6 cursor-pointer relative overflow-hidden group" 
                  style={{animationDelay: (i*0.08)+'s'}}
                  onClick={function(){setSelectedJob(job)}}>
                  
                  {/* Gradient top bar */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  {/* Status Badge - Top Right */}
                  <div className="absolute top-5 right-5">
                    <span className={"text-[10px] font-bold px-3 py-1.5 rounded-full border " + 
                      (job.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : 
                       job.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" : 
                       "bg-red-50 text-red-700 border-red-200")}>
                      {job.status === "approved" ? "✅ Approved" : job.status === "pending" ? "⏳ Pending" : "❌ Rejected"}
                    </span>
                  </div>

                  {/* Company + Title */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg flex-shrink-0">
                      {(job.company || "C").charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-extrabold text-gray-900 truncate" style={{ fontFamily: "'Syne', sans-serif" }}>{job.title}</h3>
                      <p className="text-sm text-gray-500 font-medium">{job.company} • {job.location}</p>
                    </div>
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="bg-violet-50 rounded-xl p-3 text-center">
                      <p className="text-base font-extrabold text-violet-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>₹{(job.salaryMin/100000).toFixed(0)}L</p>
                      <p className="text-[9px] text-violet-400 font-bold uppercase">Salary</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                      <p className="text-base font-extrabold text-emerald-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{apps.length}</p>
                      <p className="text-[9px] text-emerald-400 font-bold uppercase">Applied</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3 text-center">
                      <p className="text-base font-extrabold text-amber-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{shortlisted}</p>
                      <p className="text-[9px] text-amber-400 font-bold uppercase">Shortlist</p>
                    </div>
                    <div className="bg-sky-50 rounded-xl p-3 text-center">
                      <p className="text-base font-extrabold text-sky-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{hired}</p>
                      <p className="text-[9px] text-sky-400 font-bold uppercase">Hired</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(job.skills || "").split(',').slice(0, 5).map(function(skill: string) {
                      return <span key={skill} className="text-[10px] bg-violet-50 text-violet-600 px-2.5 py-1 rounded-full font-semibold border border-violet-100">{skill.trim()}</span>;
                    })}
                    {(job.skills || "").split(',').length > 5 && <span className="text-[10px] text-gray-400 px-2 py-1">+more</span>}
                  </div>

                  {/* Deadline */}
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    <span>📅</span>
                    <span>Deadline: <strong className="text-gray-700">{new Date(job.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button onClick={function(e: any){e.stopPropagation(); setSelectedJob(job);}}
                      className="flex-1 py-2.5 bg-violet-50 text-violet-700 text-xs font-bold rounded-xl hover:bg-violet-100 transition-all border border-violet-200">
                      👥 View Applicants ({apps.length})
                    </button>
                    <button onClick={function(e: any){e.stopPropagation(); deleteJob(job.id);}}
                      className="px-4 py-2.5 bg-red-50 text-red-500 text-xs font-bold rounded-xl hover:bg-red-100 transition-all border border-red-200">
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* JOB DETAIL MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={function(){setSelectedJob(null);}}>
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-8 shadow-2xl slide-up" onClick={function(e: any){e.stopPropagation();}}>
            
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl">
                  {(selectedJob.company || "C").charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: "'Syne', sans-serif" }}>{selectedJob.title}</h2>
                  <p className="text-violet-600 font-semibold">{selectedJob.company}</p>
                  <p className="text-sm text-gray-500">{selectedJob.location} • {selectedJob.type}</p>
                </div>
              </div>
              <button onClick={function(){setSelectedJob(null);}} className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all">✕</button>
            </div>

            {/* Salary + Deadline */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-4 text-center border border-violet-100">
                <p className="text-xl font-extrabold text-violet-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>₹{(selectedJob.salaryMin/100000).toFixed(1)}L - ₹{(selectedJob.salaryMax/100000).toFixed(1)}L</p>
                <p className="text-[10px] text-violet-400 font-bold uppercase">Salary Range</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 text-center border border-emerald-100">
                <p className="text-xl font-extrabold text-emerald-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{(selectedJob.applications || []).length}</p>
                <p className="text-[10px] text-emerald-400 font-bold uppercase">Applicants</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 text-center border border-amber-100">
                <p className="text-xl font-extrabold text-amber-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{new Date(selectedJob.deadline).toLocaleDateString()}</p>
                <p className="text-[10px] text-amber-400 font-bold uppercase">Deadline</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-3">📝 Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-2xl p-5">{selectedJob.description}</p>
            </div>

            {/* Requirements */}
            {selectedJob.requirements && (
              <div className="mb-6">
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-3">📋 Requirements</h3>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-2xl p-5 whitespace-pre-line">{selectedJob.requirements}</p>
              </div>
            )}

            {/* Skills */}
            <div className="mb-6">
              <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-3">🛠️ Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(selectedJob.skills || "").split(',').map(function(skill: string) {
                  return <span key={skill} className="px-4 py-2 bg-violet-50 text-violet-700 rounded-xl text-sm font-bold border border-violet-100">{skill.trim()}</span>;
                })}
              </div>
            </div>

            {/* Action */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button onClick={function(){setSelectedJob(null);}}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all">
                Close
              </button>
              <button onClick={function(){deleteJob(selectedJob.id);}}
                className="px-6 py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-all shadow-lg">
                🗑️ Delete Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}