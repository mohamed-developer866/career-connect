import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router";
import Sidebar from "../../../components/Sidebar";

const testCategories = [
  {
    title: "Mock Tests",
    icon: "🎯",
    tests: [
      { id: "js", title: "JavaScript Fundamentals", questions: 30, time: "30 min", difficulty: "Medium", icon: "📜", color: "#f7df1e" },
      { id: "react", title: "React JS Interview Prep", questions: 30, time: "30 min", difficulty: "Medium", icon: "⚛️", color: "#61dafb" },
      { id: "dsa", title: "DSA Fundamentals", questions: 30, time: "30 min", difficulty: "Hard", icon: "🧮", color: "#6c47ff" },
    ],
  },
  {
    title: "Aptitude",
    icon: "🧠",
    tests: [
      { id: "quant", title: "Quantitative Aptitude", questions: 20, time: "20 min", difficulty: "Medium", icon: "🔢", color: "#f59e0b" },
      { id: "logical", title: "Logical Reasoning", questions: 20, time: "20 min", difficulty: "Medium", icon: "🧩", color: "#10b981" },
      { id: "verbal", title: "Verbal Ability", questions: 20, time: "15 min", difficulty: "Easy", icon: "📝", color: "#3b82f6" },
    ],
  },
  {
    title: "Quick Generate",
    icon: "⚡",
    tests: [
      { id: "custom", title: "AI-Generated Test", questions: "Custom", time: "Custom", difficulty: "Any", icon: "🤖", color: "#ec4899" },
    ],
  },
];

const recentTests = [
  { name: "JavaScript Fundamentals", score: "24/30", date: "May 8, 2026", passed: true },
  { name: "React JS Interview", score: "18/30", date: "May 5, 2026", passed: false },
  { name: "Quantitative Aptitude", score: "16/20", date: "May 2, 2026", passed: true },
];

export default function Assessments() {
  const { user } = useOutletContext<any>();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f6fa]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
      `}</style>
      <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-[#1a1f3c] via-[#2d3470] to-[#1e2d5a] px-10 py-10 min-h-[180px] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(108,71,255,0.18),transparent_60%)]"></div>
          <div className="relative z-10">
            <span className="inline-flex items-center bg-[#7c5cfc] text-white text-xs font-bold px-4 py-2 rounded-full mb-4">📝 ASSESSMENTS</span>
            <h1 className="text-white font-extrabold text-4xl tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Test Your Skills</h1>
            <p className="text-white/65 text-lg mt-2">AI-powered mock tests to prepare for interviews</p>
          </div>
        </div>

        <div className="px-10 py-8 space-y-8">
          {/* Test Categories */}
          {testCategories.map((category) => (
            <div key={category.title}>
              <h2 className="text-lg font-bold text-[#1a1f3c] mb-4 flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                <span>{category.icon}</span> {category.title}
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {category.tests.map((test) => (
                  <div
  key={test.id}
  onClick={() => {
    if (test.id === "custom") {
      navigate("/student/assessments/generate");
    } else {
      // Store config and navigate to generate page
      localStorage.setItem("testConfig", JSON.stringify({
        topic: test.title,
        difficulty: test.difficulty,
        questionCount: typeof test.questions === "number" ? test.questions : 30,
        timeLimit: parseInt(test.time) || 30,
      }));
      navigate("/student/assessments/generate");
    }
  }}
  className="bg-white border border-[#e5e7eb] rounded-2xl p-5 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group shadow-sm"
>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md" style={{ background: `${test.color}20` }}>
                        {test.icon}
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        test.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700" :
                        test.difficulty === "Hard" ? "bg-red-50 text-red-700" :
                        "bg-amber-50 text-amber-700"
                      }`}>{test.difficulty}</span>
                    </div>
                    <h3 className="text-base font-bold text-[#1a1f3c] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>{test.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-[#6b7280] mb-3">
                      <span>📝 {test.questions} Questions</span>
                      <span>⏱️ {test.time}</span>
                    </div>
                    <button className="w-full py-2.5 bg-[#6c47ff] text-white text-sm font-semibold rounded-xl hover:bg-[#5a3de0] transition-all group-hover:shadow-lg group-hover:shadow-[#6c47ff]/20">
                      {test.id === "custom" ? "⚡ Generate" : "▶ Start Test"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Recent Tests */}
          <div>
            <h2 className="text-lg font-bold text-[#1a1f3c] mb-4 flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              🕐 Recent Attempts
            </h2>
            <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden shadow-sm">
              {recentTests.map((t, i) => (
                <div key={i} className={`flex items-center justify-between px-6 py-4 ${i < recentTests.length - 1 ? "border-b border-[#f3f4f6]" : ""} hover:bg-[#f8f7ff] transition-all cursor-pointer`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${t.passed ? "bg-emerald-50" : "bg-red-50"}`}>
                      {t.passed ? "✅" : "❌"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1a1f3c]">{t.name}</p>
                      <p className="text-xs text-[#6b7280]">{t.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-bold ${t.passed ? "text-emerald-600" : "text-red-500"}`}>{t.score}</span>
                    <button className="text-xs font-semibold text-[#6c47ff] hover:underline">Retake →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}