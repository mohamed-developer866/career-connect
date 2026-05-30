import { useState, useEffect, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router";
import Sidebar from "../../../../components/Sidebar";

// Simple syntax highlighter for JavaScript/HTML/CSS
function CodeHighlighter({ code }: { code: string }) {
  return (
    <div>
      {code.split('\n').map((line, i) => (
        <div key={i} className="flex">
          <span className="text-[#555] mr-4 select-none w-8 text-right flex-shrink-0 text-xs">{i + 1}</span>
          <span className="text-[#d4d4d4] text-sm font-mono whitespace-pre">{line}</span>
        </div>
      ))}
    </div>
  );
}

type Question = {
  id: number;
  question: string;
  code?: string;
  options: string[];
  answer: number;
  topic: string;
  difficulty: string;
  type?: string;
};

export default function TakeTest() {
  const { user } = useOutletContext<any>();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(1800);
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const timerRef = useRef<any>(null);
  const autoAdvanceRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("testQuestions");
    const config = localStorage.getItem("testConfig");
    if (saved) setQuestions(JSON.parse(saved));
    if (config) {
      const { timeLimit } = JSON.parse(config);
      setTimeLeft(timeLimit * 60);
    }
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timeLeft, submitted]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (optionIndex: number) => {
    if (submitted || showResult) return;
    setAnswers({ ...answers, [questions[currentQ].id]: optionIndex });
    setShowResult(true);
    
    // Auto advance after 1.5 seconds
    clearTimeout(autoAdvanceRef.current);
    autoAdvanceRef.current = setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setShowResult(false);
      }
    }, 1300);
  };

  const handleNext = () => {
    clearTimeout(autoAdvanceRef.current);
    if (currentQ < questions.length - 1) { setCurrentQ(currentQ + 1); setShowResult(false); }
  };

  const handlePrev = () => {
    clearTimeout(autoAdvanceRef.current);
    if (currentQ > 0) { setCurrentQ(currentQ - 1); setShowResult(false); }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    clearInterval(timerRef.current);
    clearTimeout(autoAdvanceRef.current);
    if (questions.length === 0) return;
    const score = questions.filter((q) => answers[q.id] === q.answer).length;
    localStorage.setItem("testResult", JSON.stringify({
      total: questions.length, score, answers, questions,
      timeTaken: (JSON.parse(localStorage.getItem("testConfig") || "{}").timeLimit * 60 || 1800) - timeLeft,
    }));
    setTimeout(() => navigate("/student/assessments/result"), 800);
  };

  if (questions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f5f6fa]">
        <div className="text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-[#6b7280]">No questions loaded. Please generate a test first.</p>
          <button onClick={() => navigate("/student/assessments/generate")} className="mt-4 px-6 py-2 bg-[#6c47ff] text-white rounded-xl text-sm font-semibold">
            Generate Test
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  const answered = answers[q?.id] !== undefined;
  const isCorrect = answered && answers[q?.id] === q?.answer;
  const selectedAnswer = answers[q?.id];
  const typeLabel = q?.type || "MCQ";

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f6fa]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-[#0D1B40] text-white px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-sm font-bold">Assessment</h1>
            <p className="text-[10px] text-[#8899BB]">{questions.length} Questions • {q?.difficulty}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#6c47ff]/20 text-[#6c47ff]">{typeLabel}</span>
            <div className="text-sm">Q {currentQ + 1} / {questions.length}</div>
            <div className={`text-xl font-bold font-mono ${timeLeft < 300 ? "text-red-400 animate-pulse" : "text-white"}`}>⏱ {formatTime(timeLeft)}</div>
            <button onClick={handleSubmit} className="px-4 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600">Submit</button>
          </div>
        </div>
        <div className="h-1 bg-[#e5e7eb] flex-shrink-0"><div className="h-full bg-[#6c47ff] transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}></div></div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#e5e7eb]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#6c47ff]/10 text-[#6c47ff]">{q?.topic} • {q?.difficulty}</span>
                  <span className="text-xs text-[#6b7280]">Question {currentQ + 1}</span>
                </div>

                {/* Question Type Badge */}
                <span className={`inline-block text-[10px] font-bold px-2 py-1 rounded-full mb-4 ${
                  q?.type === "output" ? "bg-blue-50 text-blue-700" :
                  q?.type === "error" ? "bg-red-50 text-red-700" :
                  "bg-purple-50 text-purple-700"
                }`}>
                  {q?.type === "output" ? "📤 Output Prediction" : q?.type === "error" ? "🐛 Spot the Error" : "📝 Theory"}
                </span>

                {q?.code ? (
  /* SPLIT LAYOUT: Left = Question+Options, Right = Code */
  <div className="flex gap-6 mb-6">
    {/* Left: Question */}
    <div className="flex-0.7">
      <h2 className="text-lg font-bold text-[#1a1f3c] mb-2 leading-relaxed">{q?.question}</h2>
    </div>
    {/* Right: Code Editor Preview */}
    <div className="flex-1.5 bg-[#1e1e1e] rounded-xl overflow-hidden border border-[#3c3c3c] shadow-lg">
      {/* VS Code Title Bar */}
      <div className="flex items-center gap-1.5 px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
        <span className="w-3 h-3 rounded-full bg-[#ff5f56]"></span>
        <span className="w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
        <span className="w-3 h-3 rounded-full bg-[#27c93f]"></span>
        <span className="ml-3 text-[#858585] text-[11px] font-medium">
  {q?.type === "output" || q?.type === "error" ? "code.js" : "index.html"}
</span>
      </div>
      {/* Code Content with Syntax Highlighting */}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono leading-relaxed" style={{ fontFamily: "'Cascadia Code', 'Fira Code', monospace" }}>
          <CodeHighlighter code={q.code} />
        </pre>
      </div>
    </div>
  </div>
) : (
  /* FULL WIDTH: Question only */
  <h2 className="text-lg font-bold text-[#1a1f3c] mb-6 leading-relaxed">{q?.question}</h2>
)}

                {/* Options */}
                <div className="space-y-3">
                  {q?.options.map((option, i) => {
                    let bg = "bg-white border-[#e5e7eb] hover:border-[#6c47ff]/30 hover:bg-[#f8f7ff]";
                    let letterBg = "bg-gray-100 text-[#6b7280]";
                    if (showResult || submitted) {
                      if (i === q.answer) { bg = "bg-emerald-50 border-emerald-400"; letterBg = "bg-emerald-500 text-white"; }
                      else if (i === selectedAnswer && !isCorrect) { bg = "bg-red-50 border-red-400"; letterBg = "bg-red-500 text-white"; }
                    } else if (selectedAnswer === i) {
                      bg = "bg-[#6c47ff]/10 border-[#6c47ff]"; letterBg = "bg-[#6c47ff] text-white";
                    }
                    return (
                      <button key={i} onClick={() => handleAnswer(i)} disabled={submitted}
                        className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center gap-4 ${bg}`}>
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${letterBg}`}>
                          {showResult && i === q.answer ? "✓" : showResult && i === selectedAnswer && !isCorrect ? "✗" : String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-[15px] font-medium">{option}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback */}
                {showResult && (
                  <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
                    isCorrect ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    <span className="text-2xl">{isCorrect ? "🎉" : "💡"}</span>
                    <div>
                      <p className="text-sm font-bold">{isCorrect ? "Correct! Great job!" : "Not quite right"}</p>
                      {!isCorrect && <p className="text-xs mt-1">Correct answer: <strong>{q?.options[q?.answer]}</strong></p>}
                      <p className="text-[10px] mt-1 opacity-70">Auto-advancing in 1.5s...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-6">
                <button onClick={handlePrev} disabled={currentQ === 0} className="px-6 py-3 border border-[#e5e7eb] text-[#1a1f3c] text-sm font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-30">← Previous</button>
                <span className="text-xs text-[#6b7280] self-center">{Object.keys(answers).length} of {questions.length} answered</span>
                <button onClick={handleNext} disabled={currentQ === questions.length - 1} className="px-6 py-3 bg-[#6c47ff] text-white text-sm font-semibold rounded-xl hover:bg-[#5a3de0] disabled:opacity-30">Next →</button>
              </div>
            </div>
          </div>

          <div className="w-64 bg-white border-l border-[#e5e7eb] p-5 flex flex-col flex-shrink-0 overflow-y-auto">
            <h3 className="text-sm font-bold text-[#1a1f3c] mb-4">Question Palette</h3>
            <div className="grid grid-cols-5 gap-2 flex-1">
              {questions.map((q, i) => {
                const isAns = answers[q.id] !== undefined;
                const isCrct = isAns && answers[q.id] === q.answer;
                return (
                  <button key={i} onClick={() => { setCurrentQ(i); setShowResult(!!isAns); }}
                    className={`w-9 h-9 rounded-lg text-xs font-bold transition-all hover:scale-105 relative ${
                      i === currentQ ? "bg-[#0D1B40] text-white ring-2 ring-[#6c47ff]" :
                      isCrct ? "bg-emerald-500 text-white" :
                      isAns ? "bg-red-500 text-white" :
                      "bg-gray-100 text-[#6b7280]"
                    }`}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t space-y-2 text-xs">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500"></div>Correct</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500"></div>Wrong</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gray-100"></div>Not Answered</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#0D1B40]"></div>Current</div>
            </div>
            <button onClick={handleSubmit} className="mt-4 w-full py-3 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600">Submit Test</button>
          </div>
        </div>
      </main>
    </div>
  );
}