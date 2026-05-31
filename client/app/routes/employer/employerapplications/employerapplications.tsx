import { useState, useEffect } from "react";
import { useOutletContext } from "react-router";


export default function EmployerApplications() {
  const { user } = useOutletContext<any>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/jobs/employer/applications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        if (data.jobs?.length > 0 && !selectedJob) {
          setSelectedJob(data.jobs[0]);
          setShowDetail(true);
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load applications", "error");
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = async (applicationId: string, fileName: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/applications/${applicationId}/resume`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'resume.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast("Resume downloaded successfully", "success");
      } else {
        showToast("Failed to download resume", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error downloading resume", "error");
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      
      if (res.ok) {
        showToast(`Application ${status.toLowerCase()}`, "success");
        loadApplications(); // Refresh
      } else {
        showToast("Failed to update status", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating status", "error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HIRED': return 'bg-green-100 text-green-700';
      case 'Shortlisted': return 'bg-blue-100 text-blue-700';
      case 'Interview': return 'bg-purple-100 text-purple-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{animationDelay: "0.15s"}}></div>
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{animationDelay: "0.3s"}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/30">
     
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-blue-100 px-6 py-4 flex-shrink-0">
          <h1 className="text-xl font-bold text-blue-800">📋 Job Applications</h1>
          <p className="text-xs text-blue-500 mt-0.5">Manage candidates who applied to your jobs</p>
        </div>

        {/* Toast */}
        {toast && (
          <div className="absolute top-4 right-4 z-50">
            <div className={`px-4 py-3 rounded-xl shadow-lg ${toast.type === "success" ? "bg-green-500" : "bg-red-500"} text-white`}>
              {toast.message}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden p-4 gap-4">
          {/* Job List */}
          <div className="w-80 bg-white rounded-xl shadow-sm border border-blue-100 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-blue-100 bg-blue-50">
              <h3 className="text-sm font-semibold text-blue-700">Your Jobs</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {jobs.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-3xl mb-2 block">📭</span>
                  <p className="text-slate-500 text-sm">No jobs posted yet</p>
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => { setSelectedJob(job); setShowDetail(true); }}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${selectedJob?.id === job.id ? "bg-blue-50 border-l-4 border-blue-500" : "bg-white border border-gray-100 hover:shadow-sm"}`}
                  >
                    <p className="font-semibold text-sm text-slate-800">{job.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{job.company}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {job.applications?.length || 0} applicants
                      </span>
                      <span className="text-[10px] text-slate-400">{job.location}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Applications List */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-blue-100 flex flex-col overflow-hidden">
            {!showDetail || !selectedJob ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl mb-2 block">👈</span>
                  <p className="text-slate-500 text-sm">Select a job to view applications</p>
                </div>
              </div>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-blue-100 bg-blue-50 flex-shrink-0">
                  <h3 className="text-sm font-semibold text-blue-700">
                    {selectedJob.title} - {selectedJob.applications?.length || 0} Applicants
                  </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedJob.applications?.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="text-3xl mb-2 block">👥</span>
                      <p className="text-slate-500 text-sm">No applications yet</p>
                    </div>
                  ) : (
                    selectedJob.applications.map((app: any) => (
                      <div key={app.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                {app.studentName?.charAt(0) || "S"}
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-slate-800">{app.studentName}</p>
                                <p className="text-xs text-slate-500">{app.studentEmail}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 text-xs mt-3">
                              <div>
                                <span className="text-slate-400">College:</span>
                                <p className="text-slate-700 font-medium">{app.college || "N/A"}</p>
                              </div>
                              <div>
                                <span className="text-slate-400">Department:</span>
                                <p className="text-slate-700 font-medium">{app.department || "N/A"}</p>
                              </div>
                              <div>
                                <span className="text-slate-400">Applied on:</span>
                                <p className="text-slate-700">{new Date(app.appliedAt).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <span className="text-slate-400">Match Score:</span>
                                <p className="text-blue-600 font-semibold">{app.matchScore}%</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                            
                            <div className="flex gap-1 mt-2">
                              <select
                                value={app.status}
                                onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                                className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="Applied">Applied</option>
                                <option value="Shortlisted">Shortlisted</option>
                                <option value="Interview">Interview</option>
                                <option value="HIRED">HIRED</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                              
                              {app.resume && (
                                <button
                                  onClick={() => downloadResume(app.id, app.resumeFileName || "resume.pdf")}
                                  className="px-2 py-1 bg-blue-500 text-white text-[10px] rounded-lg hover:bg-blue-600 transition"
                                >
                                  📄 Resume
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}