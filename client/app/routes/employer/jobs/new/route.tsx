import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router";

export default function PostJob() {
  var navigate = useNavigate();
  const { user } = useOutletContext<any>();
  var [form, setForm] = useState({
    title: "", company: user?.company || "", location: "", type: "Full-time",
    salaryMin: "", salaryMax: "", description: "", requirements: "",
    skills: "", deadline: "", maxApplicants: "50"
  });
  var [loading, setLoading] = useState(false);
  var [aiLoading, setAiLoading] = useState(false);
  var [success, setSuccess] = useState(false);
  var [colleges, setColleges] = useState<any[]>([]);
  var [selectedCollege, setSelectedCollege] = useState("all");
  var [collegeSearch, setCollegeSearch] = useState("");
  var [generatingAI, setGeneratingAI] = useState(false);

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

  var generateAIDescription = async function() {
    if (!form.title || !form.skills) {
      alert("Please enter job title and skills first");
      return;
    }
    
    setAiLoading(true);
    try {
      var token = localStorage.getItem("token");
      var res = await fetch("http://localhost:5000/api/chatbot/generate-job-description", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({
          title: form.title,
          skills: form.skills,
          type: form.type,
          salary: form.salaryMin && form.salaryMax ? `${form.salaryMin} - ${form.salaryMax}` : ""
        })
      });
      
      if (res.ok) {
        var data = await res.json();
        setForm(function(prev: any) { 
          return { 
            ...prev, 
            description: data.description || prev.description,
            requirements: data.requirements || prev.requirements
          }; 
        });
      } else {
        // Fallback AI generation locally
        generateLocalAIContent();
      }
    } catch (err) {
      console.error("AI generation failed:", err);
      generateLocalAIContent();
    } finally {
      setAiLoading(false);
    }
  };

  var generateLocalAIContent = function() {
    const skillsList = form.skills.split(',').map(s => s.trim());
    const description = `We are looking for a talented ${form.title} to join our team at ${form.company || "our company"}. 
    
Key Responsibilities:
• Develop and maintain high-quality applications using ${skillsList.slice(0, 3).join(', ')}
• Collaborate with cross-functional teams to define and ship new features
• Write clean, scalable, and efficient code
• Troubleshoot and debug applications
• Participate in code reviews and technical discussions

Requirements:
• ${Math.floor(Math.random() * 5) + 2}+ years of experience in ${form.title}
• Strong proficiency in ${skillsList.slice(0, 4).join(', ')}
• Experience with version control (Git)
• Bachelor's degree in Computer Science or related field
• Excellent problem-solving and communication skills

Nice to Have:
• Experience with cloud platforms (AWS/Azure/GCP)
• Knowledge of Docker and Kubernetes
• Experience with agile development methodologies

Join us to work on exciting projects and grow your career!`;

    const requirements = `• ${Math.floor(Math.random() * 5) + 2}+ years of experience in ${form.title}
• Strong proficiency in ${skillsList.slice(0, 4).join(', ')}
• Experience with REST APIs and microservices architecture
• Knowledge of database systems (MySQL/PostgreSQL/MongoDB)
• Familiarity with Git and CI/CD pipelines
• Bachelor's degree in Computer Science or equivalent experience
• Excellent communication and teamwork skills`;

    setForm(function(prev: any) { 
      return { 
        ...prev, 
        description: prev.description || description,
        requirements: prev.requirements || requirements
      }; 
    });
  };

  var generateRequirements = function() {
    if (!form.title || !form.skills) {
      alert("Please enter job title and skills first");
      return;
    }
    generateLocalAIContent();
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
          salaryMin: parseInt(form.salaryMin) || 0,
          salaryMax: parseInt(form.salaryMax) || 0,
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center bg-white rounded-3xl p-10 shadow-2xl max-w-md slide-up">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2" style={{fontFamily:"'Syne',sans-serif"}}>Job Posted Successfully!</h2>
          <p className="text-gray-500 text-sm">Redirecting to your jobs...</p>
          <div className="mt-4 h-1.5 w-32 mx-auto bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-teal-600 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Syne:wght@600;700;800&display=swap');
        
        @keyframes slideUp { 
          0% { opacity: 0; transform: translateY(30px); } 
          100% { opacity: 1; transform: translateY(0); } 
        }
        
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.5); }
        }
        
        .slide-up { animation: slideUp 0.4s ease both; }
        .input-field { transition: all 0.2s ease; }
        .input-field:focus { transform: translateY(-1px); }
        .college-card { transition: all 0.2s ease; }
        .college-card:hover { transform: translateY(-2px); }
        .ai-button { transition: all 0.2s ease; }
        .ai-button:hover { transform: scale(1.02); }
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>

      <div className="max-w-5xl mx-auto px-6 py-8">
        
        {/* HEADER */}
        <div className="mb-8 slide-up">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-xl">📝</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800" style={{fontFamily:"'Syne',sans-serif"}}>Post New Job</h1>
              <p className="text-xs text-slate-500 mt-0.5">Create a job listing for students</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* COMPANY INFO - FIXED FROM DB */}
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm slide-up">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">🏢 Company Information</h3>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm shadow-md">
                  {form.company?.charAt(0) || "C"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{form.company || "Your Company"}</p>
                  <p className="text-[10px] text-slate-400">Company name is automatically set from your profile</p>
                </div>
              </div>
            </div>
          </div>

          {/* COLLEGE SELECTION */}
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm slide-up">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">🎯 Target College</h3>
            <div className="relative mb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input type="text" placeholder="Search colleges..." value={collegeSearch}
                onChange={function(e: any){setCollegeSearch(e.target.value)}}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all bg-slate-50" />
            </div>

            <div onClick={function(){setSelectedCollege("all")}}
              className={`college-card p-3 rounded-lg border cursor-pointer mb-2 transition-all ${selectedCollege === "all" ? "border-indigo-400 bg-indigo-50 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm text-sm">🌐</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">All Colleges</p>
                  <p className="text-[10px] text-slate-500">Post to every registered college</p>
                </div>
                {selectedCollege === "all" && <span className="text-indigo-500 font-bold text-base">✓</span>}
              </div>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {filteredColleges.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-3">No colleges found</p>
              ) : (
                filteredColleges.map(function(college: any) {
                  return (
                    <div key={college.id} onClick={function(){setSelectedCollege(college.id)}}
                      className={`college-card p-2.5 rounded-lg border cursor-pointer transition-all ${selectedCollege === college.id ? "border-indigo-400 bg-indigo-50 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                          {(college.name || college.college || "C").charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{college.name || college.college}</p>
                          <div className="flex gap-3 text-[10px] text-slate-500">
                            <span>👥 {college.totalStudents || 0}</span>
                            {college.placementRate > 0 && <span className="text-emerald-600 font-medium">📈 {college.placementRate}%</span>}
                          </div>
                        </div>
                        {selectedCollege === college.id && <span className="text-indigo-500 font-bold text-base">✓</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* BASIC INFO */}
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm slide-up">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">📋 Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">Job Title *</label>
                <input type="text" required value={form.title} onChange={function(e: any){handleChange('title',e.target.value)}}
                  placeholder="e.g. Senior React Developer"
                  className="input-field w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 bg-slate-50 text-slate-800" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">Job Type</label>
                <select value={form.type} onChange={function(e: any){handleChange('type',e.target.value)}}
                  className="input-field w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 bg-slate-50 text-slate-800">
                  <option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">Location</label>
                <input type="text" value={form.location} onChange={function(e: any){handleChange('location',e.target.value)}}
                  placeholder="e.g. Bangalore / Remote"
                  className="input-field w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 bg-slate-50 text-slate-800" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">Skills *</label>
                <input type="text" required value={form.skills} onChange={function(e: any){handleChange('skills',e.target.value)}}
                  placeholder="React, Node.js, Python"
                  className="input-field w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 bg-slate-50 text-slate-800" />
              </div>
            </div>
          </div>

          {/* SALARY */}
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm slide-up">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">💰 Salary Range (Annual)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">Min (₹)</label>
                <input type="number" value={form.salaryMin} onChange={function(e: any){handleChange('salaryMin',e.target.value)}}
                  placeholder="e.g. 600000"
                  className="input-field w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 bg-slate-50 text-slate-800" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">Max (₹)</label>
                <input type="number" value={form.salaryMax} onChange={function(e: any){handleChange('salaryMax',e.target.value)}}
                  placeholder="e.g. 1200000"
                  className="input-field w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 bg-slate-50 text-slate-800" />
              </div>
            </div>
          </div>

          {/* AI DESCRIPTION & REQUIREMENTS */}
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm slide-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">🤖 AI-Generated Content</h3>
              <div className="flex gap-2">
                <button type="button" onClick={generateAIDescription} disabled={aiLoading}
                  className="ai-button px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-semibold rounded-lg hover:shadow-md transition-all disabled:opacity-50 flex items-center gap-1">
                  {aiLoading ? "⏳ Generating..." : "✨ Generate with AI"}
                </button>
                <button type="button" onClick={generateRequirements}
                  className="ai-button px-3 py-1.5 border border-indigo-300 text-indigo-600 text-[10px] font-semibold rounded-lg hover:bg-indigo-50 transition-all">
                  📋 Generate Requirements
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">Job Description *</label>
                <textarea required rows={6} value={form.description} onChange={function(e: any){handleChange('description',e.target.value)}}
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  className="input-field w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 bg-slate-50 text-slate-800 resize-none" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">Requirements</label>
                <textarea rows={5} value={form.requirements} onChange={function(e: any){handleChange('requirements',e.target.value)}}
                  placeholder="e.g. 2+ years experience, Bachelor's degree..."
                  className="input-field w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 bg-slate-50 text-slate-800 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">Deadline *</label>
                  <input type="date" required value={form.deadline} onChange={function(e: any){handleChange('deadline',e.target.value)}}
                    className="input-field w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 bg-slate-50 text-slate-800" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">Max Applicants</label>
                  <input type="number" value={form.maxApplicants} onChange={function(e: any){handleChange('maxApplicants',e.target.value)}}
                    className="input-field w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 bg-slate-50 text-slate-800" />
                </div>
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 justify-end slide-up">
            <button type="button" onClick={function(){navigate("/employer/jobs")}}
              className="px-6 py-2 border-2 border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-8 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
              {loading ? "⏳ Posting..." : "🚀 Post Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}