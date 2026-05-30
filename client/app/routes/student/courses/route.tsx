import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router";
import Sidebar from "../../../components/Sidebar";

export default function CourseLibrary() {
  const { user } = useOutletContext<any>();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

 useEffect(function() {
    var loadCourses = async function() {
      try {
        var token = localStorage.getItem("token");
        console.log("Token:", token ? "Found" : "MISSING");
        
        var res = await fetch("http://localhost:5000/api/learning/courses/all", {
          headers: { Authorization: "Bearer " + token }
        });
        
        console.log("API Status:", res.status);
        
        if (res.ok) {
          var data = await res.json();
          console.log("API Response:", data);
          console.log("Courses count:", data.courses ? data.courses.length : "No courses key");
          
          if (data.courses && data.courses.length > 0) {
            setCourses(data.courses);
          } else {
            console.log("No courses in response");
            setCourses([]);
          }
        } else {
          console.log("API Error:", res.status);
        }
      } catch (err) { 
        console.error("Fetch error:", err); 
      }
      finally { setLoading(false); }
    };
    loadCourses();
  }, []);

  var colors = ["#6c47ff", "#3cc68a", "#ff6b35", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981", "#EC4899", "#06B6D4"];
  var bgGradients = [
    "linear-gradient(135deg,#e8f8f0,#c8f0dc)",
    "linear-gradient(135deg,#e8eeff,#d0daff)",
    "linear-gradient(135deg,#e0f7fa,#b2ebf2)",
    "linear-gradient(135deg,#f3f4f6,#e5e7eb)",
    "linear-gradient(135deg,#f3e8ff,#e9d5ff)",
    "linear-gradient(135deg,#fff7ed,#fed7aa)",
    "linear-gradient(135deg,#fef2f2,#fecaca)",
    "linear-gradient(135deg,#ecfdf5,#a7f3d0)",
  ];

  if (loading) {
    return (
      <div className="flex h-screen bg-[#f5f6fa]">
        <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={function() { setSidebarCollapsed(!sidebarCollapsed); }} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6c47ff] to-[#a78bfa] animate-pulse mx-auto mb-4 flex items-center justify-center text-2xl">📚</div>
            <div className="flex gap-2 justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#6c47ff] animate-bounce"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#6c47ff] animate-bounce" style={{ animationDelay: "0.15s" }}></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#6c47ff] animate-bounce" style={{ animationDelay: "0.3s" }}></div>
            </div>
            <p className="text-slate-500 text-sm mt-4">Loading courses...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f6fa]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800&display=swap');
        
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes pulse_glow { 0%, 100% { box-shadow: 0 0 20px rgba(108,71,255,0.1); } 50% { box-shadow: 0 0 40px rgba(108,71,255,0.3); } }
        
        .animate-in { animation: fadeInUp 0.6s ease forwards; }
        .course-card { animation: fadeIn 0.4s ease both; }
        .course-card:hover { animation: pulse_glow 2s infinite; }
        .hero-icon { animation: float 3s ease-in-out infinite; }
        
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={function() { setSidebarCollapsed(!sidebarCollapsed); }} />

      <main className="flex-1 overflow-y-auto">
        {/* HERO BANNER */}
        <div className="relative bg-gradient-to-br from-[#1a1f3c] via-[#2d3470] to-[#1e2d5a] px-12 py-14 flex items-center justify-between overflow-hidden min-h-[200px]">
          <div className="absolute inset-0">
            <div className="absolute w-96 h-96 bg-[#6c47ff]/10 rounded-full -top-20 -left-20 blur-3xl"></div>
            <div className="absolute w-64 h-64 bg-[#3cc68a]/10 rounded-full bottom-0 right-20 blur-3xl"></div>
          </div>
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-xs font-bold px-5 py-2.5 rounded-full mb-4 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-[#3cc68a] animate-pulse"></span>
              🚀 2026 READY CURRICULUM
            </span>
            <h1 className="text-white font-black text-5xl tracking-tight leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>Course Library</h1>
            <p className="text-white/60 text-lg mt-3 font-medium">Learn skills that actually get you a job</p>
          </div>
          <div className="hero-icon relative z-10 text-8xl select-none">⌨️</div>
        </div>

        {/* COURSES GRID */}
        <div className="px-8 py-10">
          <div className="flex items-center justify-between mb-8 animate-in">
            <div>
              <h2 className="text-2xl font-bold text-[#1a1f3c]" style={{ fontFamily: "'Syne', sans-serif" }}>📚 All Courses</h2>
              <p className="text-sm text-[#6b7280] mt-1">{courses.length} courses available for you</p>
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-7xl block mb-6">📚</span>
              <h3 className="text-xl font-bold text-[#1a1f3c] mb-2">No courses yet</h3>
              <p className="text-[#6b7280]">Courses will appear here once added to the database.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {courses.map(function(course, i) {
                var bg = bgGradients[i % bgGradients.length];
                var color = colors[i % colors.length];
                var progress = Math.floor(Math.random() * 60);
                return (
                  <div key={course.id} 
                    onClick={function() { navigate("/student/courses/learn/" + course.id); }}
                    className="course-card bg-white rounded-2xl border border-[#e5e7eb] cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden group"
                    style={{ animationDelay: (i * 0.08) + 's' }}>
                    
                    {/* Card Thumbnail */}
                    <div className="h-44 flex items-center justify-center text-6xl relative" style={{ background: bg }}>
                      <span>{course.icon || "📚"}</span>
                      <span className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-[11px] font-bold text-[#6c47ff] shadow-sm">
                        <span className="w-2 h-2 rounded-sm bg-[#6c47ff]"></span>Course
                      </span>
                      <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-bold text-[#1a1f3c] shadow-sm">
                        {course.difficulty || "Beginner"}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-5">
                      <h3 className="font-bold text-[#1a1f3c] text-base mb-2 group-hover:text-[#6c47ff] transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-[#6b7280] mb-3">
                        {course.category || "General"} • {course.duration || "20 hours"} • {course.totalTopics || 22} topics
                      </p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(course.tags || ["React", "Hooks", "State"]).slice(0, 4).map(function(tag: string) {
                          return <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">{tag}</span>;
                        })}
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-2 text-xs mb-2">
                        <strong className="text-[#1a1f3c]">{progress}%</strong>
                        <span className="text-[#6b7280]">Completed</span>
                      </div>
                      <div className="h-1.5 bg-[#e5e7eb] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: progress + '%', background: color }}></div>
                      </div>

                      {/* Action */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#f3f4f6]">
                        <span className="text-xs font-bold" style={{ color: color }}>{progress}% done</span>
                        <span className="text-xs text-[#6b7280] group-hover:text-[#6c47ff] transition-colors font-semibold flex items-center gap-1">
                          Start Learning <span className="text-lg leading-none">→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}