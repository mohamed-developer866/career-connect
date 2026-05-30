import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router";
import Sidebar from "../../../../components/Sidebar";

const courseData = {
  "intro-js": {
    title: "Introduction to JS & Variables",
    icon: "📝",
    color: "#6C63FF",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    progress: 50,
    totalProblems: 8,
    solvedProblems: 4,
    problems: [
      { id: "color-picker", title: "Color Picker", difficulty: "Easy", pts: 80, status: "IN PROGRESS" },
      { id: "traffic-light", title: "Traffic Light", difficulty: "Easy", pts: 30, status: "NOT ATTEMPTED" },
      { id: "seasons-switcher", title: "Seasons Switcher", difficulty: "Easy", pts: 20, status: "NOT ATTEMPTED" },
      { id: "toggle-button", title: "Toggle Button", difficulty: "Easy", pts: 40, status: "NOT ATTEMPTED" },
      { id: "counter-app", title: "Counter Application", difficulty: "Medium", pts: 60, status: "NOT ATTEMPTED" },
      { id: "greeting-card", title: "Greeting Card", difficulty: "Easy", pts: 25, status: "SOLVED" },
      { id: "theme-switcher", title: "Theme Switcher", difficulty: "Medium", pts: 70, status: "NOT ATTEMPTED" },
      { id: "stopwatch", title: "Stopwatch Timer", difficulty: "Hard", pts: 100, status: "NOT ATTEMPTED" },
    ],
  },
};

export default function ProblemList() {
  const { user } = useOutletContext<any>();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const course = courseData["intro-js"];

  const statusColor = (status: string) => {
    if (status === "SOLVED") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "IN PROGRESS") return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-slate-100 text-slate-500 border-slate-200";
  };

  const difficultyColor = (d: string) => {
    if (d === "Easy") return "bg-emerald-50 text-emerald-600";
    if (d === "Medium") return "bg-amber-50 text-amber-600";
    return "bg-red-50 text-red-600";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f6fa]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="flex-1 overflow-y-auto">
        {/* Course Header */}
        <div className="relative overflow-hidden" style={{ background: course.gradient }}>
          <div className="absolute inset-0 bg-black/15"></div>
          <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="relative z-10 px-10 py-8">
            <button onClick={() => navigate("/student/practice")} className="text-white/70 text-sm font-medium hover:text-white transition-all flex items-center gap-1 mb-4">
              ← Back to Courses
            </button>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{course.icon}</span>
              <div>
                <h1 className="text-white font-extrabold text-2xl tracking-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>{course.title}</h1>
                <p className="text-white/70 text-sm mt-1">{course.solvedProblems} of {course.totalProblems} problems solved</p>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-4 max-w-md">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white/80 text-xs font-medium">Overall Progress</span>
                <span className="text-white font-bold text-xs">{course.progress}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${course.progress}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Problem List */}
        <div className="px-10 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1a1f3c]" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Problems ({course.totalProblems})
            </h2>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span> Solved
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                <span className="w-3 h-3 rounded-full bg-amber-400"></span> In Progress
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                <span className="w-3 h-3 rounded-full bg-slate-300"></span> Not Attempted
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {course.problems.map((problem, idx) => (
              <div
                key={problem.id}
                onClick={() => navigate(`/student/practice/intro-js/${problem.id}`)}
                className="bg-white border border-[#e5e7eb] rounded-2xl p-5 flex items-center gap-5 cursor-pointer hover:shadow-xl hover:border-[#6c47ff]/20 hover:-translate-y-0.5 transition-all group shadow-sm"
                style={{ animation: `fadeIn .3s ease both ${idx * 0.05}s` }}
              >
                {/* Problem Number */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: `${course.color}10`, color: course.color }}>
                  {idx + 1}
                </div>

                {/* Problem Info */}
                <div className="flex-1">
                  <h3 className="text-[15px] font-semibold text-[#1a1f3c] group-hover:text-[#6c47ff] transition-colors">{problem.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${difficultyColor(problem.difficulty)}`}>{problem.difficulty}</span>
                    <span className="text-xs text-[#6b7280]">{problem.pts} points</span>
                  </div>
                </div>

                {/* Status Badge */}
                <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full border ${statusColor(problem.status)}`}>
                  {problem.status === "IN PROGRESS" ? "⏳ In Progress" : problem.status === "SOLVED" ? "✅ Solved" : "⬜ Not Attempted"}
                </span>

                {/* Arrow */}
                <span className="text-xl text-[#6b7280] group-hover:text-[#6c47ff] group-hover:translate-x-1 transition-all">→</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}