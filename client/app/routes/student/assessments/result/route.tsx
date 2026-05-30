import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router";
import Sidebar from "../../../../components/Sidebar";

function spawnCelebration() {
  const colors = ["#6c47ff", "#3cc68a", "#f7df1e", "#ff5f56", "#56ccf2", "#ffbd2e", "#ec4899", "#a78bfa", "#f97316"];
  for (let i = 0; i < 150; i++) {
    setTimeout(() => {
      const el = document.createElement("div");
      const size = 4 + Math.random() * 12;
      const startX = 35 + Math.random() * 30;
      const startY = 30 + Math.random() * 20;
      const angle = Math.random() * 360;
      const distance = 100 + Math.random() * 300;
      const tx = Math.cos(angle * Math.PI / 180) * distance;
      const ty = Math.sin(angle * Math.PI / 180) * distance;
      el.style.cssText = `
        position: fixed; left: ${startX}vw; top: ${startY}vh;
        width: ${size}px; height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: ${Math.random() > 0.5 ? "50%" : "3px"};
        pointer-events: none; z-index: 9999;
        animation: sparkleBurst${i % 4} ${1 + Math.random() * 2}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3500);
    }, i * 10);
  }
  if (!document.getElementById("sparkle-keyframes")) {
    const s = document.createElement("style");
    s.id = "sparkle-keyframes";
    s.textContent = `
      @keyframes sparkleBurst0 { 0%{transform:translate(0,0) scale(1) rotate(0deg);opacity:1} 100%{transform:translate(${200 + Math.random()*200}px,${-100 - Math.random()*200}px) scale(0) rotate(720deg);opacity:0} }
      @keyframes sparkleBurst1 { 0%{transform:translate(0,0) scale(1) rotate(0deg);opacity:1} 100%{transform:translate(${-200 - Math.random()*200}px,${-100 - Math.random()*200}px) scale(0) rotate(-720deg);opacity:0} }
      @keyframes sparkleBurst2 { 0%{transform:translate(0,0) scale(1) rotate(0deg);opacity:1} 100%{transform:translate(${100 + Math.random()*150}px,${150 + Math.random()*150}px) scale(0) rotate(540deg);opacity:0} }
      @keyframes sparkleBurst3 { 0%{transform:translate(0,0) scale(1) rotate(0deg);opacity:1} 100%{transform:translate(${-100 - Math.random()*150}px,${150 + Math.random()*150}px) scale(0) rotate(-540deg);opacity:0} }
      @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      @keyframes scorePop { 0%{transform:scale(0) rotate(-15deg);opacity:0} 50%{transform:scale(1.2) rotate(5deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
      @keyframes floatUp { 0%{transform:translateY(30px);opacity:0} 100%{transform:translateY(0);opacity:1} }
      @keyframes pulseGlow { 0%,100%{box-shadow:0 0 20px rgba(108,71,255,0.4)} 50%{box-shadow:0 0 40px rgba(108,71,255,0.8),0 0 60px rgba(60,198,138,0.4)} }
      @keyframes slideRight { 0%{transform:translateX(-10px);opacity:0} 100%{transform:translateX(0);opacity:1} }
    `;
    document.head.appendChild(s);
  }
}

export default function TestResult() {
  const { user } = useOutletContext<any>();
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [selectedQ, setSelectedQ] = useState(0);
  const [animDone, setAnimDone] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("testResult");
    if (saved) {
      setResult(JSON.parse(saved));
      spawnCelebration();
      setTimeout(() => setAnimDone(true), 800);
    }
  }, []);

  if (!result) {
    return (
      <div className="flex h-screen bg-[#f5f6fa] items-center justify-center">
        <div className="text-center">
          <span className="text-5xl block mb-4">📋</span>
          <p className="text-[#6b7280] text-lg mb-4">No result found</p>
          <button onClick={() => navigate("/student/assessments")} className="px-6 py-3 bg-[#6c47ff] text-white rounded-xl text-sm font-bold hover:bg-[#5a3de0] transition-all">
            Go to Tests
          </button>
        </div>
      </div>
    );
  }

  const { total, score, timeTaken, questions, answers } = result;
  const percentage = Math.round((score / total) * 100);
  const timeMinutes = Math.floor(timeTaken / 60);
  const timeSeconds = timeTaken % 60;
  const wrongAnswers = total - score;
  const skipped = questions.filter((q: any) => answers[q.id] === undefined).length;

  const getGrade = (pct: number) => {
    if (pct >= 90) return { label: "Outstanding! 🏆", emoji: "🏆", color: "#6c47ff", bg: "from-[#6c47ff] to-[#a78bfa]" };
    if (pct >= 75) return { label: "Great Job! 🎉", emoji: "🎉", color: "#3cc68a", bg: "from-[#3cc68a] to-[#6ee7b7]" };
    if (pct >= 60) return { label: "Good Effort! 👍", emoji: "👍", color: "#f59e0b", bg: "from-[#f59e0b] to-[#fbbf24]" };
    if (pct >= 40) return { label: "Keep Going! 💪", emoji: "💪", color: "#f97316", bg: "from-[#f97316] to-[#fb923c]" };
    return { label: "Never Give Up! 🚀", emoji: "🚀", color: "#ef4444", bg: "from-[#ef4444] to-[#f87171]" };
  };

  const grade = getGrade(percentage);

  const topicStats: Record<string, { total: number; correct: number }> = {};
  questions.forEach((q: any) => {
    if (!topicStats[q.topic]) topicStats[q.topic] = { total: 0, correct: 0 };
    topicStats[q.topic].total++;
    if (answers[q.id] === q.answer) topicStats[q.topic].correct++;
  });

  const currentReview = questions[selectedQ];
  const userAns = answers[currentReview?.id];
  const isCorrect = userAns === currentReview?.answer;
  const isSkipped = userAns === undefined;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f6fa]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
      `}</style>
      <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="flex-1 flex overflow-hidden">
        {/* ── LEFT PANEL ── */}
        <div className="w-[420px] bg-white border-r border-[#e5e7eb] overflow-y-auto flex-shrink-0">
          {/* Score Hero with Shimmer */}
          <div className={`relative overflow-hidden p-8 text-center bg-gradient-to-br ${grade.bg}`}>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)", backgroundSize: "200% 100%", animation: "shimmer 3s infinite" }}></div>
            <div className="relative z-10">
              <span className="text-6xl block mb-3" style={{ animation: animDone ? "floatUp 0.6s ease forwards" : "none", opacity: animDone ? 1 : 0 }}>{grade.emoji}</span>
              <h1 className="text-2xl font-extrabold text-white mb-1" style={{ fontFamily: "'Syne', sans-serif", animation: animDone ? "floatUp 0.6s 0.1s ease forwards" : "none", opacity: animDone ? 1 : 0 }}>{grade.label}</h1>
              
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white/15 backdrop-blur-sm border-[5px] border-white/30 my-5"
                style={{ animation: "scorePop 0.7s 0.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards", animation: animDone ? "pulseGlow 2s infinite" : "scorePop 0.7s 0.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards" }}>
                <div className="text-center">
                  <span className="text-4xl font-extrabold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{score}</span>
<span className="text-white/50 text-sm font-light align-center">/{total}</span>
                </div>
              </div>
              <p className="text-white text-xl font-bold">{percentage}% Score</p>
              <p className="text-white/60 text-xl mt-1 flex items-center justify-center gap-1">
                <span>⏱️</span> {timeMinutes}:{String(timeSeconds).padStart(2, "0")} min
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 divide-x divide-[#e5e7eb] border-b border-[#e5e7eb]">
            {[
              { value: score, label: "Correct", color: "#3cc68a", icon: "✅" },
              { value: wrongAnswers, label: "Wrong", color: "#ef4444", icon: "❌" },
              { value: skipped, label: "Skipped", color: "#9ca3af", icon: "⬜" },
            ].map((stat, i) => (
              <div key={i} className="p-4 text-center" style={{ animation: `floatUp 0.5s ${0.3 + i * 0.1}s ease forwards`, opacity: animDone ? 1 : 0 }}>
                <p className="text-2xl font-bold" style={{ color: stat.color, fontFamily: "'Syne', sans-serif" }}>{stat.value}</p>
                <p className="text-[10px] text-[#6b7280] font-medium">{stat.icon} {stat.label}</p>
              </div>
            ))}
          </div>

          {/* Topic Breakdown */}
          <div className="p-5" style={{ animation: `floatUp 0.5s 0.5s ease forwards`, opacity: animDone ? 1 : 0 }}>
            <h3 className="text-sm font-bold text-[#1a1f3c] mb-4 flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              <span>📊</span> Topic Performance
            </h3>
            <div className="space-y-3">
              {Object.entries(topicStats).map(([topic, stats]) => {
                const tp = Math.round((stats.correct / stats.total) * 100);
                return (
                  <div key={topic}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-semibold text-[#1a1f3c]">{topic}</span>
                      <span className="text-[11px] font-bold" style={{ color: tp >= 75 ? "#3cc68a" : tp >= 50 ? "#f59e0b" : "#ef4444" }}>
                        {stats.correct}/{stats.total} ({tp}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${tp}%`, background: tp >= 75 ? "linear-gradient(90deg, #3cc68a, #6ee7b7)" : tp >= 50 ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : "linear-gradient(90deg, #ef4444, #f87171)" }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="p-5 border-t border-[#e5e7eb] space-y-2" style={{ animation: `floatUp 0.5s 0.6s ease forwards`, opacity: animDone ? 1 : 0 }}>
            <button onClick={() => navigate("/student/assessments/generate")} className="w-full py-3.5 bg-[#6c47ff] text-white text-sm font-bold rounded-2xl hover:bg-[#5a3de0] hover:shadow-lg hover:shadow-[#6c47ff]/20 transition-all active:scale-[0.98]">
              🔄 Take Another Test
            </button>
            <button onClick={() => navigate("/student/assessments")} className="w-full py-3.5 border-2 border-[#e5e7eb] text-[#1a1f3c] text-sm font-bold rounded-2xl hover:bg-gray-50 hover:border-[#d1d5db] transition-all">
              📚 Back to Test Library
            </button>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Question Palette */}
          <div className="bg-white border-b border-[#e5e7eb] px-5 py-3 flex items-center gap-2 overflow-x-auto flex-shrink-0">
            <span className="text-xs font-bold text-[#6b7280] mr-2">Review:</span>
            {questions.map((q: any, i: number) => {
              const ua = answers[q.id];
              const ic = ua === q.answer;
              const isk = ua === undefined;
              return (
                <button key={i} onClick={() => setSelectedQ(i)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold flex-shrink-0 transition-all hover:scale-110 ${
                    i === selectedQ ? "ring-[3px] ring-[#6c47ff] ring-offset-2 scale-110" : ""
                  } ${
                    ic ? "bg-emerald-500 text-white shadow-md" : isk ? "bg-gray-200 text-gray-400" : "bg-red-500 text-white shadow-md"
                  }`}>
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Question Detail */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto" style={{ animation: `slideRight 0.4s ${selectedQ * 0.02}s ease forwards` }}>
              <div className={`rounded-3xl p-8 border-2 transition-all duration-300 ${
                isCorrect ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300 shadow-lg shadow-emerald-100" :
                isSkipped ? "bg-white border-[#e5e7eb] shadow-sm" :
                "bg-gradient-to-br from-red-50 to-rose-50 border-red-300 shadow-lg shadow-red-100"
              }`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#6c47ff]/10 text-[#6c47ff] border border-[#6c47ff]/20">
                      {currentReview?.topic}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      currentReview?.difficulty === "Easy" ? "bg-emerald-100 text-emerald-700" :
                      currentReview?.difficulty === "Hard" ? "bg-red-100 text-red-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {currentReview?.difficulty}
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 text-base font-bold px-4 py-2 rounded-2xl ${
                    isCorrect ? "bg-emerald-500/10 text-emerald-600" :
                    isSkipped ? "bg-gray-100 text-gray-400" :
                    "bg-red-500/10 text-red-500"
                  }`}>
                    <span>{isCorrect ? "✅" : isSkipped ? "⬜" : "❌"}</span>
                    {isCorrect ? "Correct!" : isSkipped ? "Skipped" : "Wrong"}
                  </div>
                </div>

                {/* Question */}
                <h2 className="text-lg font-bold text-[#1a1f3c] mb-5 leading-relaxed" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Q{selectedQ + 1}: {currentReview?.question}
                </h2>

                {/* Code */}
                {currentReview?.code && (
                  <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden mb-5 border border-[#3c3c3c] shadow-xl">
                    <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#252526] border-b border-[#3c3c3c]">
                      <span className="w-3 h-3 rounded-full bg-[#ff5f56]"></span>
                      <span className="w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
                      <span className="w-3 h-3 rounded-full bg-[#27c93f]"></span>
                      <span className="ml-3 text-[#858585] text-[11px] font-medium">code.js</span>
                    </div>
                    <pre className="p-5 text-[#d4d4d4] text-sm font-mono leading-relaxed overflow-x-auto whitespace-pre">{currentReview.code}</pre>
                  </div>
                )}

                {/* Options */}
                <div className="space-y-2.5 mb-5">
                  {currentReview?.options.map((opt: string, i: number) => {
                    const isUserChoice = userAns === i;
                    const isCorrectChoice = currentReview.answer === i;
                    let bg = "bg-white border-[#e5e7eb]";
                    let badgeBg = "bg-gray-100 text-[#6b7280]";
                    if (isCorrectChoice) { bg = "bg-emerald-50 border-emerald-400"; badgeBg = "bg-emerald-500 text-white"; }
                    else if (isUserChoice && !isCorrect) { bg = "bg-red-50 border-red-400"; badgeBg = "bg-red-500 text-white"; }
                    return (
                      <div key={i} className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${bg}`}>
                        <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${badgeBg}`}>
                          {isCorrectChoice ? "✓" : isUserChoice && !isCorrect ? "✗" : String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-sm font-medium text-[#1a1f3c]">{opt}</span>
                        {isCorrectChoice && <span className="ml-auto text-emerald-500 text-sm">← Correct Answer</span>}
                        {isUserChoice && !isCorrectChoice && <span className="ml-auto text-red-400 text-sm">← Your Answer</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Feedback */}
                {isSkipped && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-sm text-blue-700 flex items-center gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className="font-bold">You skipped this question</p>
                      <p className="text-xs mt-0.5">Correct answer: <strong>{currentReview?.options[currentReview?.answer]}</strong></p>
                    </div>
                  </div>
                )}
                {!isCorrect && !isSkipped && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-700 flex items-center gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className="font-bold">The correct answer is:</p>
                      <p className="text-xs mt-0.5"><strong>{currentReview?.options[currentReview?.answer]}</strong></p>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#e5e7eb]">
                  <button onClick={() => setSelectedQ(Math.max(0, selectedQ - 1))} disabled={selectedQ === 0}
                    className="px-5 py-3 border-2 border-[#e5e7eb] text-sm font-bold rounded-2xl hover:bg-gray-50 hover:border-[#d1d5db] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                    ← Prev
                  </button>
                  <span className="text-sm font-semibold text-[#6b7280] bg-gray-50 px-4 py-2 rounded-xl">
                    {selectedQ + 1} / {questions.length}
                  </span>
                  <button onClick={() => setSelectedQ(Math.min(questions.length - 1, selectedQ + 1))} disabled={selectedQ === questions.length - 1}
                    className="px-5 py-3 bg-[#6c47ff] text-white text-sm font-bold rounded-2xl hover:bg-[#5a3de0] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}