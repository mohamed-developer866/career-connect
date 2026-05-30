import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router";
import Sidebar from "../../../components/Sidebar";

const courses = [
  {
    id: "intro-js",
    title: "Introduction to JS & Variables",
    subtitle: "Arrays & Objects",
    description: "Learn JavaScript fundamentals — variables, data types, and basic operations that form the foundation of web development.",
    icon: "📝",
    color: "#6C63FF",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    progress: 50,
    totalProblems: 8,
    completedProblems: 4,
    difficulty: "Beginner",
    estimatedHours: 12,
    studentsEnrolled: 2840,
    tags: ["JavaScript", "Variables", "Data Types"],
  },
  {
    id: "arrays-objects",
    title: "Arrays & Objects",
    subtitle: "Data Structures in JS",
    description: "Master arrays and objects — the two most important data structures in JavaScript for managing collections of data.",
    icon: "📊",
    color: "#3B82F6",
    gradient: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
    progress: 33,
    totalProblems: 6,
    completedProblems: 2,
    difficulty: "Beginner",
    estimatedHours: 10,
    studentsEnrolled: 2150,
    tags: ["Arrays", "Objects", "Data Structures"],
  },
  {
    id: "fetch-callbacks",
    title: "Fetch & Callbacks",
    subtitle: "Async JavaScript",
    description: "Learn to work with APIs, handle asynchronous operations, and master callbacks for real-world web applications.",
    icon: "🌐",
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    progress: 0,
    totalProblems: 5,
    completedProblems: 0,
    difficulty: "Intermediate",
    estimatedHours: 15,
    studentsEnrolled: 1820,
    tags: ["Fetch", "APIs", "Callbacks", "Async"],
  },
  {
    id: "fetch-callbacks2",
    title: "Fetch & Callbacks 2",
    subtitle: "Advanced Async Patterns",
    description: "Dive deeper into promises, async/await, and advanced API integration patterns used in production applications.",
    icon: "⚡",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    progress: 0,
    totalProblems: 4,
    completedProblems: 0,
    difficulty: "Intermediate",
    estimatedHours: 12,
    studentsEnrolled: 1240,
    tags: ["Promises", "Async/Await", "Error Handling"],
  },
  {
    id: "fetch-callbacks3",
    title: "Fetch & Callbacks 3",
    subtitle: "Real-World API Projects",
    description: "Build real-world projects using REST APIs, handle authentication, and manage complex data flows in your applications.",
    icon: "🚀",
    color: "#EC4899",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    progress: 0,
    totalProblems: 3,
    completedProblems: 0,
    difficulty: "Advanced",
    estimatedHours: 18,
    studentsEnrolled: 890,
    tags: ["REST APIs", "Auth", "Projects"],
  },
  {
    id: "forms",
    title: "Forms",
    subtitle: "User Input Handling",
    description: "Master form validation, controlled components, and user input handling — essential skills for any web developer.",
    icon: "📋",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    progress: 14,
    totalProblems: 7,
    completedProblems: 1,
    difficulty: "Beginner",
    estimatedHours: 10,
    studentsEnrolled: 1950,
    tags: ["Forms", "Validation", "User Input"],
  },
  {
    id: "revision",
    title: "Revision",
    subtitle: "Practice & Master",
    description: "Comprehensive revision of all JavaScript concepts with challenging problems to test your understanding before interviews.",
    icon: "🎯",
    color: "#EF4444",
    gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
    progress: 0,
    totalProblems: 10,
    completedProblems: 0,
    difficulty: "Mixed",
    estimatedHours: 20,
    studentsEnrolled: 3200,
    tags: ["Revision", "Interview Prep", "All Topics"],
  },
];

export default function CodePractice() {
  const { user } = useOutletContext<any>();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredCourses = courses.filter(c => {
    const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = activeFilter === "all" || (activeFilter === "progress" && c.progress > 0) || (activeFilter === "not-started" && c.progress === 0) || (activeFilter === "completed" && c.progress === 100);
    return matchesSearch && matchesFilter;
  });

  const filters = [
    { id: "all", label: "All Courses", count: courses.length },
    { id: "progress", label: "In Progress", count: courses.filter(c => c.progress > 0 && c.progress < 100).length },
    { id: "completed", label: "Completed", count: courses.filter(c => c.progress === 100).length },
    { id: "not-started", label: "Not Started", count: courses.filter(c => c.progress === 0).length },
  ];

  const totalProblems = courses.reduce((sum, c) => sum + c.totalProblems, 0);
  const totalCompleted = courses.reduce((sum, c) => sum + c.completedProblems, 0);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f6fa]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="flex-1 overflow-y-auto">
        {/* Hero Banner */}
        <div className="relative bg-gradient-to-br from-[#1a1f3c] via-[#2d3470] to-[#1e2d5a] px-10 py-10 flex items-center justify-between min-h-[200px] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(108,71,255,0.2),transparent_60%)]"></div>
          <div className="absolute top-10 right-20 w-40 h-40 bg-[#6c47ff]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-60 h-20 bg-[#3cc68a]/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 bg-[#7c5cfc] text-white text-[11px] font-bold px-4 py-2 rounded-full mb-4 tracking-wide">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              CODING PRACTICE
            </span>
            <h1 className="text-white font-extrabold tracking-tight leading-none" style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)" }}>Sharpen Your Skills</h1>
            <p className="text-white/65 text-lg mt-2 font-medium max-w-lg">Practice coding problems with real-time feedback and AI-powered guidance</p>
          </div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-extrabold text-white" style={{ fontFamily: "'Clash Display', sans-serif" }}>{totalProblems}</div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Total Problems</p>
            </div>
            <div className="w-px h-14 bg-white/15"></div>
            <div className="text-center">
              <div className="text-4xl font-extrabold text-[#3cc68a]" style={{ fontFamily: "'Clash Display', sans-serif" }}>{totalCompleted}</div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Solved</p>
            </div>
          </div>
        </div>

        <div className="px-10 py-8">
          {/* Search & Filter Bar */}
          <div className="flex items-center gap-4 mb-8 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text" placeholder="Search courses or topics..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-5 py-3.5 bg-white border-2 border-[#e5e7eb] rounded-2xl text-sm font-medium outline-none focus:border-[#6c47ff] focus:ring-4 focus:ring-[#6c47ff]/10 transition-all text-[#1a1f3c] shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              {filters.map((f) => (
                <button key={f.id} onClick={() => setActiveFilter(f.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    activeFilter === f.id
                      ? "bg-[#6c47ff] text-white shadow-lg shadow-[#6c47ff]/25"
                      : "bg-white border-2 border-[#e5e7eb] text-[#6b7280] hover:border-[#6c47ff] hover:text-[#6c47ff]"
                  }`}>
                  {f.label}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeFilter === f.id ? "bg-white/20 text-white" : "bg-[#f3f4f6] text-[#6b7280]"}`}>{f.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Course Grid */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl block mb-4">🔍</span>
              <h3 className="text-xl font-bold text-[#1a1f3c] mb-2">No courses found</h3>
              <p className="text-[#6b7280]">Try a different search or filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              {filteredCourses.map((course, idx) => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/student/practice/${course.id}`)}
                  className="bg-white rounded-2xl overflow-hidden cursor-pointer group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-[#e5e7eb]"
                  style={{ animation: `fadeIn .4s ease both ${idx * 0.06}s` }}
                >
                  <div className="flex">
                    {/* Left Gradient Section */}
                    <div className="w-40 flex-shrink-0 flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ background: course.gradient }}>
                      <div className="absolute inset-0 bg-black/10"></div>
                      <span className="text-5xl relative z-10 drop-shadow-lg mb-3">{course.icon}</span>
                      <span className="relative z-10 text-white text-[10px] font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">{course.difficulty}</span>
                    </div>

                    {/* Right Content Section */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-base font-bold text-[#1a1f3c] leading-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>{course.title}</h3>
                          <p className="text-xs text-[#6b7280] mt-0.5">{course.subtitle}</p>
                        </div>
                      </div>

                      <p className="text-[13px] text-[#6b7280] mb-3 line-clamp-2 leading-relaxed">{course.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {course.tags.map((tag) => (
                          <span key={tag} className="text-[10px] px-2.5 py-1 rounded-lg bg-[#f8f7ff] text-[#6c47ff] font-semibold border border-[#e5e7eb]">{tag}</span>
                        ))}
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] text-[#6b7280] font-medium">{course.completedProblems}/{course.totalProblems} problems solved</span>
                          <span className="text-xs font-bold text-[#6c47ff]">{course.progress}%</span>
                        </div>
                        <div className="h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${course.progress}%`, background: course.gradient }}></div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#f3f4f6]">
                        <div className="flex items-center gap-3 text-[11px] text-[#6b7280]">
                          <span className="flex items-center gap-1">⏱️ {course.estimatedHours}h</span>
                          <span className="flex items-center gap-1">👥 {course.studentsEnrolled.toLocaleString()}</span>
                        </div>
                        <span className="text-xs font-bold text-white px-4 py-1.5 rounded-lg transition-all group-hover:scale-105" style={{ background: course.gradient }}>
                          {course.progress === 0 ? "Start" : course.progress === 100 ? "Review" : "Continue"} →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}