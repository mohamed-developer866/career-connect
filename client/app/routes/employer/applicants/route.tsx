import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function EmployerApplicants() {
  var navigate = useNavigate();
  var [jobs, setJobs] = useState<any[]>([]);
  var [selectedJob, setSelectedJob] = useState<any>(null);
  var [applicants, setApplicants] = useState<any[]>([]);
  var [loading, setLoading] = useState(true);

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
    var token = localStorage.getItem("token");
    await fetch("http://localhost:5000/api/applications/" + appId + "/status", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ status: status })
    });
    if (selectedJob) loadApplicants(selectedJob.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#6c47ff] animate-bounce"></div>
          <div className="w-3 h-3 rounded-full bg-[#6c47ff] animate-bounce" style={{animationDelay:"0.15s"}}></div>
          <div className="w-3 h-3 rounded-full bg-[#6c47ff] animate-bounce" style={{animationDelay:"0.3s"}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto" style={{fontFamily:"'Inter',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        .card { animation: fadeIn 0.3s ease both; }
      `}</style>

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900" style={{fontFamily:"'Syne',sans-serif"}}>👥 Applicants</h1>
        <p className="text-slate-500 text-sm mt-1">Review and manage job applications</p>
      </div>

      {/* Job Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {jobs.map(function(job: any) {
          return (
            <button key={job.id} onClick={function(){ setSelectedJob(job); loadApplicants(job.id); }}
              className={"px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all " + 
                (selectedJob?.id === job.id ? "bg-[#6c47ff] text-white shadow-md" : "bg-white text-slate-600 border hover:border-[#6c47ff]")}>
              {job.title} ({job.applications?.length || 0})
            </button>
          );
        })}
      </div>

      {/* Applicants List */}
      {selectedJob && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {selectedJob.title} — <span className="text-[#6c47ff]">{applicants.length} applicants</span>
            </h2>
          </div>

          {applicants.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <span className="text-5xl block mb-4">👥</span>
              <p className="text-slate-500">No applicants yet for this job</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.map(function(app: any, i: number) {
                return (
                  <div key={app.id} className="card bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all" style={{animationDelay:(i*0.05)+"s"}}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6c47ff] to-[#a78bfa] flex items-center justify-center text-white font-bold text-lg shadow">
                          {app.studentName?.charAt(0) || "S"}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">{app.studentName}</h3>
                          <p className="text-sm text-slate-500">{app.studentEmail}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{app.college} • {app.department}</p>
                        </div>
                      </div>
                      <span className={"text-xs font-bold px-3 py-1.5 rounded-full border " + 
                        (app.status === "Shortlisted" ? "bg-amber-50 text-amber-700 border-amber-200" :
                         app.status === "Hired" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                         app.status === "Rejected" ? "bg-red-50 text-red-700 border-red-200" :
                         "bg-blue-50 text-blue-700 border-blue-200")}>
                        {app.status || "Applied"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-4 mb-3">
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-sm font-bold text-[#6c47ff]">{app.matchScore || 0}%</p>
                        <p className="text-[10px] text-slate-500">AI Match</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-sm font-bold text-slate-900">{new Date(app.appliedAt).toLocaleDateString()}</p>
                        <p className="text-[10px] text-slate-500">Applied</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-sm font-bold text-slate-900">{app.resume ? "📄 Yes" : "❌ No"}</p>
                        <p className="text-[10px] text-slate-500">Resume</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-slate-100">
                      {app.resume && (
                        <button className="flex-1 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all">
                          📄 View Resume
                        </button>
                      )}
                      <button onClick={function(){updateStatus(app.id, "Shortlisted")}}
                        className="flex-1 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-all">
                        ⭐ Shortlist
                      </button>
                      <button onClick={function(){updateStatus(app.id, "Hired")}}
                        className="flex-1 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-all">
                        ✅ Hire
                      </button>
                      <button onClick={function(){updateStatus(app.id, "Rejected")}}
                        className="flex-1 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-all">
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}