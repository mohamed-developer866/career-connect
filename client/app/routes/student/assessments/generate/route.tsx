import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router";
import Sidebar from "../../../../components/Sidebar";
import { generateTestQuestions } from "../../../../lib/api";

const topics = [
  { id: "javascript", label: "JavaScript", icon: "📜", color: "#f7df1e" },
  { id: "react", label: "React JS", icon: "⚛️", color: "#61dafb" },
  { id: "python", label: "Python", icon: "🐍", color: "#3b82f6" },
  { id: "dsa", label: "DSA", icon: "🧮", color: "#6c47ff" },
  { id: "html-css", label: "HTML/CSS", icon: "🎨", color: "#e44d26" },
  { id: "sql", label: "SQL", icon: "🗄️", color: "#10b981" },
  { id: "aptitude", label: "Aptitude", icon: "🧠", color: "#f59e0b" },
  { id: "logical", label: "Logical Reasoning", icon: "🧩", color: "#ec4899" },
];

const difficulties = ["Easy", "Medium", "Hard"];
const questionCounts = [10, 20, 30, 50];
const timeLimits = [10, 20, 30, 45, 60];

export default function GenerateTest() {
  const { user } = useOutletContext<any>();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(30);
  const [timeLimit, setTimeLimit] = useState(30);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const handleGenerate = async () => {
    if (!selectedTopic) return;
    setLoading(true);
    setProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 400);

    try {
      const data = await generateTestQuestions(selectedTopic, difficulty, questionCount);
      clearInterval(progressInterval);
      setProgress(100);
      
      localStorage.setItem("testQuestions", JSON.stringify(data.questions));
      localStorage.setItem("testConfig", JSON.stringify({
        topic: selectedTopic, difficulty, questionCount, timeLimit,
      }));
      
      setTimeout(() => {
        setLoading(false);
        navigate("/student/assessments/take");
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setLoading(false);
      alert("Failed to generate questions. Please try again.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f6fa]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`}</style>
      <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-10 py-10">
          {/* Back button */}
          <button onClick={() => navigate("/student/assessments")} className="text-[#6b7280] hover:text-[#1a1f3c] text-sm font-medium mb-6 flex items-center gap-1">
            ← Back to Tests
          </button>

          <h1 className="text-2xl font-bold text-[#1a1f3c] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            ⚡ Generate AI-Powered Test
          </h1>
          <p className="text-[#6b7280] mb-8">DeepSeek AI will create unique questions based on your preferences</p>

          {/* Topic Selection */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-sm font-bold text-[#1a1f3c] uppercase tracking-wider mb-4">📚 Select Topic</h2>
            <div className="grid grid-cols-4 gap-3">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    selectedTopic === topic.id
                      ? "border-[#6c47ff] bg-[#f8f7ff] shadow-md"
                      : "border-[#e5e7eb] hover:border-[#6c47ff]/30 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-3xl block mb-2">{topic.icon}</span>
                  <span className="text-sm font-semibold text-[#1a1f3c]">{topic.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-sm font-bold text-[#1a1f3c] uppercase tracking-wider mb-4">🎯 Difficulty Level</h2>
            <div className="flex gap-3">
              {difficulties.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                    difficulty === d
                      ? d === "Easy" ? "bg-emerald-500 text-white shadow-lg" :
                        d === "Medium" ? "bg-amber-500 text-white shadow-lg" :
                        "bg-red-500 text-white shadow-lg"
                      : "bg-gray-100 text-[#6b7280] hover:bg-gray-200"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-sm font-bold text-[#1a1f3c] uppercase tracking-wider mb-4">📝 Number of Questions</h2>
            <div className="flex gap-3">
              {questionCounts.map((count) => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                    questionCount === count
                      ? "bg-[#6c47ff] text-white shadow-lg"
                      : "bg-gray-100 text-[#6b7280] hover:bg-gray-200"
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Time Limit */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 mb-8 shadow-sm">
            <h2 className="text-sm font-bold text-[#1a1f3c] uppercase tracking-wider mb-4">⏱️ Time Limit (minutes)</h2>
            <div className="flex gap-3">
              {timeLimits.map((time) => (
                <button
                  key={time}
                  onClick={() => setTimeLimit(time)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                    timeLimit === time
                      ? "bg-[#6c47ff] text-white shadow-lg"
                      : "bg-gray-100 text-[#6b7280] hover:bg-gray-200"
                  }`}
                >
                  {time} min
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          {/* Generate Button with Progress */}
<button
  onClick={handleGenerate}
  disabled={!selectedTopic || loading}
  className="w-full py-5 text-black text-lg font-bold rounded-2xl hover:shadow-xl transition-all disabled:cursor-not-allowed relative overflow-hidden group"
  style={{
    background: loading 
      ? `linear-gradient(90deg, #6c47ff ${progress}%, #e5e7eb ${progress}%)` 
      : "linear-gradient(135deg, #6c47ff 0%, #7c5cfc 100%)",
    boxShadow: loading ? "none" : "0 4px 20px rgba(108,71,255,0.3)",
  }}
>
  {/* Shimmer on hover (when not loading) */}
  {!loading && (
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
      background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite"
    }}></div>
  )}

  {/* Progress fill animation */}
  {loading && (
    <div className="absolute inset-0" style={{
      background: `linear-gradient(90deg, #6c47ff, #7c5cfc)`,
      width: `${progress}%`,
      transition: "width 0.3s ease"
    }}></div>
  )}

  <span className="relative z-10 flex items-center justify-center gap-3">
    {loading ? (
      <>
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray={`${progress * 0.63} 63`} strokeLinecap="round" className="transition-all" />
        </svg>
        <span>Generating... {progress}%</span>
      </>
    ) : (
      <>
        <span className="text-xl">⚡</span>
        Generate Test with AI
        <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
      </>
    )}
  </span>
</button>
        </div>
      </main>
    </div>
  );
}