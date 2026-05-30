import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function PostJob() {
  var navigate = useNavigate();
  var [form, setForm] = useState({
    title: "", company: "", location: "", type: "Full-time",
    salaryMin: "", salaryMax: "", description: "", requirements: "",
    skills: "", deadline: "", maxApplicants: "50"
  });
  var [loading, setLoading] = useState(false);
  var [success, setSuccess] = useState(false);
  var [colleges, setColleges] = useState<any[]>([]);
  var [selectedCollege, setSelectedCollege] = useState("all");
  var [collegeSearch, setCollegeSearch] = useState("");

  var filteredColleges = collegeSearch
    ? colleges.filter(function(c: any) { 
        return (c.name || c.college || "").toLowerCase().includes(collegeSearch.toLowerCase()); 
      })
    : colleges;

  useEffect(function() {
    var loadColleges = async function() {
      var token = localStorage.getItem("token");
      var res = await fetch("http://localhost:5000/api/college/rankings", {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) setColleges((await res.json()).colleges || []);
    };
    loadColleges();
  }, []);

  var handleChange = function(field: string, value: string) {
    setForm(function(prev: any) { return { ...prev, [field]: value }; });
  };

  var handleSubmit = async function(e: any) {
    e.preventDefault();
    setLoading(true);
    try {
      var token = localStorage.getItem("token");
      var res = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({
          ...form,
          collegeId: selectedCollege === "all" ? null : (selectedCollege || null)
        })
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(function() { navigate("/employer/jobs"); }, 1500);
      } else {
        var err = await res.json();
        alert(err.error || "Failed to post job");
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center bg-white rounded-3xl p-10 shadow-2xl max-w-md slide-up">
          <span className="text-6xl block mb-4">🎉</span>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2" style={{fontFamily:"'Syne',sans-serif"}}>Job Posted Successfully!</h2>
          <p className="text-gray-500">Redirecting to your jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@600;700;800&display=swap');
        @keyframes slideUp { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
        .slide-up { animation: slideUp 0.4s ease both; }
        .input-field { transition: all 0.2s ease; }
        .input-field:focus { transform: translateY(-1px); }
        .college-card { transition: all 0.2s ease; }
        .college-card:hover { transform: translateY(-2px); }
      `}</style>

      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* HEADER */}
        <div className="mb-8 slide-up">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
              <span className="text-xl">📝</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900" style={{fontFamily:"'Syne',sans-serif"}}>Post New Job</h1>
          </div>
          <p className="text-gray-500 text-sm ml-16">Create a job listing for students</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* COLLEGE SELECTION */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm slide-up">
            <h3 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2">🎯 Target College</h3>
            <div className="relative mb-4">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search colleges..." value={collegeSearch}
                onChange={function(e: any){setCollegeSearch(e.target.value)}}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-violet-400 transition-all bg-gray-50" />
            </div>

            {/* All Colleges */}
            <div onClick={function(){setSelectedCollege("all")}}
              className={"college-card p-4 rounded-xl border-2 cursor-pointer mb-2 " + (selectedCollege === "all" ? "border-violet-400 bg-violet-50 shadow-md" : "border-gray-200 hover:border-gray-300")}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow">🌐</div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">All Colleges</p>
                  <p className="text-[11px] text-gray-500">Post to every registered college</p>
                </div>
                {selectedCollege === "all" && <span className="text-violet-500 font-bold text-lg">✓</span>}
              </div>
            </div>

            {/* College List */}
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {filteredColleges.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No colleges found</p>
              ) : (
                filteredColleges.map(function(college: any) {
                  return (
                    <div key={college.id} onClick={function(){setSelectedCollege(college.id)}}
                      className={"college-card p-3 rounded-xl border-2 cursor-pointer " + (selectedCollege === college.id ? "border-violet-400 bg-violet-50 shadow-md" : "border-gray-200 hover:border-gray-300")}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold shadow flex-shrink-0">
                          {(college.name || college.college || "C").charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{college.name || college.college}</p>
                          <div className="flex gap-3 text-[11px] text-gray-500">
                            <span>👥 {college.totalStudents || 0}</span>
                            {college.placementRate > 0 && <span className="text-emerald-600 font-bold">📈 {college.placementRate}%</span>}
                          </div>
                        </div>
                        {selectedCollege === college.id && <span className="text-violet-500 font-bold text-lg">✓</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* BASIC INFO */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm slide-up">
            <h3 className="font-extrabold text-gray-900 mb-4">📋 Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Job Title *</label>
                <input type="text" required value={form.title} onChange={function(e: any){handleChange('title',e.target.value)}}
                  placeholder="e.g. Senior React Developer"
                  className="input-field w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-violet-400 bg-gray-50 text-gray-900" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Company</label>
                <input type="text" value={form.company} onChange={function(e: any){handleChange('company',e.target.value)}}
                  placeholder="Your company name"
                  className="input-field w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-violet-400 bg-gray-50 text-gray-900" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Job Type</label>
                <select value={form.type} onChange={function(e: any){handleChange('type',e.target.value)}}
                  className="input-field w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-violet-400 bg-gray-50 text-gray-900">
                  <option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Location</label>
                <input type="text" value={form.location} onChange={function(e: any){handleChange('location',e.target.value)}}
                  placeholder="e.g. Bangalore / Remote"
                  className="input-field w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-violet-400 bg-gray-50 text-gray-900" />
              </div>
            </div>
          </div>

          {/* SALARY */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm slide-up">
            <h3 className="font-extrabold text-gray-900 mb-4">💰 Salary Range (Annual)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Min (₹)</label>
                <input type="number" value={form.salaryMin} onChange={function(e: any){handleChange('salaryMin',e.target.value)}}
                  placeholder="e.g. 600000"
                  className="input-field w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-violet-400 bg-gray-50 text-gray-900" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Max (₹)</label>
                <input type="number" value={form.salaryMax} onChange={function(e: any){handleChange('salaryMax',e.target.value)}}
                  placeholder="e.g. 1200000"
                  className="input-field w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-violet-400 bg-gray-50 text-gray-900" />
              </div>
            </div>
          </div>

          {/* DETAILS */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm slide-up">
            <h3 className="font-extrabold text-gray-900 mb-4">📝 Job Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Description *</label>
                <textarea required rows={4} value={form.description} onChange={function(e: any){handleChange('description',e.target.value)}}
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  className="input-field w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-violet-400 bg-gray-50 text-gray-900 resize-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Requirements</label>
                <textarea rows={3} value={form.requirements} onChange={function(e: any){handleChange('requirements',e.target.value)}}
                  placeholder="e.g. 2+ years experience, Bachelor's degree..."
                  className="input-field w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-violet-400 bg-gray-50 text-gray-900 resize-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Skills *</label>
                  <input type="text" required value={form.skills} onChange={function(e: any){handleChange('skills',e.target.value)}}
                    placeholder="React, Node.js, Python"
                    className="input-field w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-violet-400 bg-gray-50 text-gray-900" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Deadline *</label>
                  <input type="date" required value={form.deadline} onChange={function(e: any){handleChange('deadline',e.target.value)}}
                    className="input-field w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-violet-400 bg-gray-50 text-gray-900" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Max Applicants</label>
                  <input type="number" value={form.maxApplicants} onChange={function(e: any){handleChange('maxApplicants',e.target.value)}}
                    className="input-field w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-violet-400 bg-gray-50 text-gray-900" />
                </div>
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 justify-end slide-up">
            <button type="button" onClick={function(){navigate("/employer/jobs")}}
              className="px-8 py-3.5 border-2 border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-10 py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-purple-200 transition-all disabled:opacity-50 flex items-center gap-2">
              {loading ? "Posting..." : "🚀 Post Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}