import { useState, useRef, useEffect, useCallback } from "react";
import { useOutletContext, useNavigate } from "react-router";
import Sidebar from "../../../../../components/Sidebar";
import Editor from "@monaco-editor/react";
import { askZaraCode } from "../../../../../lib/api";

const COLORS = ["#e0e0e0", "#6fcf97", "#56ccf2", "#bb6bd9"];

const INSTRUCTIONS = [
  'The HTML container element wrapping all elements should have id="colorPickerContainer".',
  'The HTML span element should have id="selectedColorHexCode".',
  'Button with text #e0e0e0 should have id="button1".',
  'Button with text #6fcf97 should have id="button2".',
  'Button with text #56ccf2 should have id="button3".',
  'Button with text #bb6bd9 should have id="button4".',
  "Each button onclick should call changeColor() passing the respective hex color value.",
  "The changeColor() JS function should update the background color of the page and the span text.",
  "Clicking a color button should visually change the page background to that color.",
];

const INITIAL_CODE = {
  html: `<div id="colorPickerContainer">
  <h1>Color Picker</h1>
  <div class="buttons">
    <button id="button1" onclick="changeColor('#e0e0e0')">#e0e0e0</button>
    <button id="button2" onclick="changeColor('#6fcf97')">#6fcf97</button>
    <button id="button3" onclick="changeColor('#56ccf2')">#56ccf2</button>
    <button id="button4" onclick="changeColor('#bb6bd9')">#bb6bd9</button>
  </div>
  <p>Background Color : <span id="selectedColorHexCode">#bb6bd9</span></p>
  <p>Try clicking on one of the colors above to change the background color of this page!</p>
</div>`,
  css: `body {
  font-family: 'Roboto', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  background: #bb6bd9;
  transition: background 0.4s ease;
}
#colorPickerContainer {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 32px 40px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}
h1 { font-size: 2rem; font-weight: 700; color: #1a1a1a; margin-bottom: 24px; }
.buttons { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 16px; }
button { padding: 14px 20px; border: 2px solid rgba(0,0,0,0.08); border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 13px; transition: transform 0.15s; }
button:hover { transform: scale(1.08); box-shadow: 0 4px 16px rgba(0,0,0,0.18); }
#button1 { background: #e0e0e0; } #button2 { background: #6fcf97; } #button3 { background: #56ccf2; } #button4 { background: #bb6bd9; }
p { color: #1a1a1a; margin-top: 8px; font-size: 15px; }
#selectedColorHexCode { font-weight: 700; color: #6c47ff; }`,
  js: `function changeColor(hex) {
  document.body.style.backgroundColor = hex;
  const span = document.getElementById('selectedColorHexCode');
  if (span) span.textContent = hex;
}`,
};

function getZaraResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("id") || q.includes("attribute")) return "Make sure every element has the **exact** `id` — for example `id=\"colorPickerContainer\"`. The test runner checks for these precisely, so even a typo will fail! 🎯";
  if (q.includes("button") || q.includes("onclick") || q.includes("click")) return "Each button needs an `onclick` that calls `changeColor()` with the hex string — like `onclick=\"changeColor('#e0e0e0')\"`. Don't forget the quotes around the hex! 🔘";
  if (q.includes("change") || q.includes("function") || q.includes("background")) return "Your `changeColor(hex)` function needs two things: `document.body.style.backgroundColor = hex` and update the span text with `getElementById('selectedColorHexCode').textContent = hex` 🎨";
  if (q.includes("css") || q.includes("style")) return "For CSS, give each button a background matching its color. Add `transition: background 0.4s ease` on `body` for a smooth color change! ✨";
  if (q.includes("html") || q.includes("structure")) return "Your HTML needs: a container `div` with `id=\"colorPickerContainer\"`, four buttons each with the right id and onclick, and a `span` with `id=\"selectedColorHexCode\"` 🏗️";
  if (q.includes("preview") || q.includes("run") || q.includes("test")) return "Click the **🖥️ Preview** tab in the right panel to see your live output — it auto-updates as you type! Or hit **Ctrl+Enter** 🚀";
  if (q.includes("help") || q.includes("stuck")) return "I'm here to help! Try asking about: **HTML structure**, **CSS styling**, **JS function logic**, or **what the instructions mean**. What's tricky? 🌟";
  return "Great question! 💡 Key things: ① correct **ids**, ② `onclick=\"changeColor('#hex')\"` on each button, ③ `changeColor()` updates `body.style.backgroundColor` and the span text. Want me to explain any?";
}

function spawnConfetti() {
  const colors = ["#6c47ff", "#3cc68a", "#f7df1e", "#e44d26", "#56ccf2", "#bb6bd9"];
  for (let i = 0; i < 90; i++) {
    const el = document.createElement("div");
    el.style.cssText = `position:fixed;left:${Math.random()*100}vw;top:-10px;width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:${Math.random()>0.5?"50%":"2px"};pointer-events:none;z-index:9999;animation:confettiFall ${1.2+Math.random()*1.8}s linear forwards;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }
  if (!document.getElementById("confetti-style")) {
    const s = document.createElement("style");
    s.id = "confetti-style";
    s.textContent = "@keyframes confettiFall{to{transform:translateY(105vh) rotate(720deg);opacity:0}}";
    document.head.appendChild(s);
  }
}

function renderMd(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i} style={{ color: "#a78bfa" }}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`")) return <code key={i} style={{ background: "#2d2356", color: "#c4b5fd", padding: "1px 5px", borderRadius: 4, fontSize: "11px", fontFamily: "monospace" }}>{p.slice(1, -1)}</code>;
    return p;
  });
}

export default function ProblemDetail() {
  const { user } = useOutletContext<any>();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");
  const [code, setCode] = useState(INITIAL_CODE);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: "ai", text: "Hi! I'm **Zara**, your AI coding tutor 🤖✨. I'm here to help you build the Color Picker. What would you like help with?" },
  ]);
  const [aiTyping, setAiTyping] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [testCases, setTestCases] = useState<{ name: string; pass: boolean }[]>([]);
  const [showTests, setShowTests] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [rightPanel, setRightPanel] = useState<"ai" | "preview">("ai");
  const [livePreviewSrc, setLivePreviewSrc] = useState("");

  const startTime = useRef(Date.now());
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState(32);
  const [rightWidth, setRightWidth] = useState(28);
  const isDragging = useRef<"left" | "right" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  useEffect(() => {
    const src = `<!DOCTYPE html><html><head><link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet"><style>${code.css}</style></head><body>${code.html}<script>${code.js}<\/script></body></html>`;
    setLivePreviewSrc(src);
  }, [code]);

  useEffect(() => { localStorage.setItem("cp_code_v3", JSON.stringify(code)); }, [code]);
  useEffect(() => { try { const saved = localStorage.getItem("cp_code_v3"); if (saved) setCode(JSON.parse(saved)); } catch {} }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); setRightPanel("preview"); }
      if (e.key === "F11") { e.preventDefault(); setFullscreen(f => !f); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // SMOOTH RESIZE
  const onMouseDownLeft = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); isDragging.current = "left";
    document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none";
  }, []);
  const onMouseDownRight = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); isDragging.current = "right";
    document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none";
  }, []);
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = (x / rect.width) * 100;
    if (isDragging.current === "left") setLeftWidth(Math.max(20, Math.min(45, pct)));
    else setRightWidth(Math.max(20, Math.min(40, 100 - pct)));
  }, []);
  const onMouseUp = useCallback(() => {
    isDragging.current = null;
    document.body.style.cursor = ""; document.body.style.userSelect = "";
  }, []);
  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, [onMouseMove, onMouseUp]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, aiTyping]);

  const centerWidth = 100 - leftWidth - rightWidth;

  const runTests = () => {
    const cases = [
      { name: 'Container id="colorPickerContainer"', pass: code.html.includes('id="colorPickerContainer"') },
      { name: 'Span id="selectedColorHexCode"', pass: code.html.includes('id="selectedColorHexCode"') },
      { name: 'Button1 id="button1"', pass: code.html.includes('id="button1"') },
      { name: 'Button2 id="button2"', pass: code.html.includes('id="button2"') },
      { name: 'Button3 id="button3"', pass: code.html.includes('id="button3"') },
      { name: 'Button4 id="button4"', pass: code.html.includes('id="button4"') },
      { name: "changeColor() defined", pass: code.js.includes("function changeColor") },
      { name: "onclick calls changeColor", pass: code.html.includes("changeColor(") },
      { name: "backgroundColor updated", pass: code.js.includes("backgroundColor") },
    ];
    setTestCases(cases); setShowTests(true);
  };

  const handleSubmit = () => { runTests(); setTimeout(() => { setSubmitted(true); spawnConfetti(); }, 600); };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const q = chatInput.trim();
    setMessages(m => [...m, { role: "user", text: q }]);
    setChatInput("");
    setAiTyping(true);
    setAiStep(0);
    
    // Simulate processing steps
    setTimeout(() => setAiStep(1), 600);
    setTimeout(() => setAiStep(2), 1200);
    setTimeout(() => setAiStep(3), 1800);
    
    try {
      const result = await askZaraCode(q, code);
      setMessages(m => [...m, { role: "ai", text: result.message }]);
      if (result.code) {
        setCode({
          html: result.code.html || code.html,
          css: result.code.css || code.css,
          js: result.code.js || code.js,
        });
      }
    } catch (err) {
      setMessages(m => [...m, { role: "ai", text: "Sorry! I couldn't reach the AI. Check your connection." }]);
    } finally {
      setAiTyping(false);
      setAiStep(0);
    }
  };
  const downloadCode = () => {
    const blob = new Blob([livePreviewSrc], { type: "text/html" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "color-picker.html"; a.click();
  };

  const passCount = testCases.filter(t => t.pass).length;

  const tabs = [
    { key: "html" as const, label: "HTML", color: "#e44d26", lang: "html" },
    { key: "css" as const, label: "CSS", color: "#264de4", lang: "css" },
    { key: "js" as const, label: "JavaScript", color: "#f7df1e", lang: "javascript" },
  ];

  const panelBg = darkMode ? "#12121f" : "#ffffff";
  const panelBg2 = darkMode ? "#0d0d1a" : "#f8f9fc";
  const borderColor = darkMode ? "#1e1e35" : "#e5e7eb";
  const textColor = darkMode ? "#e2e8f0" : "#1a1f3c";
  const mutedColor = darkMode ? "#94a3b8" : "#6b7280";
  const inputBg = darkMode ? "#1a1a2e" : "#f9fafb";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: darkMode ? "#0a0a15" : "#eef0f8", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.45;transform:scale(0.8)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:none} }
        @keyframes bounce3 { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
        .chat-msg { animation: fadeUp 0.2s ease forwards; }
        .d1 { animation: bounce3 1.2s 0s infinite; } .d2 { animation: bounce3 1.2s 0.15s infinite; } .d3 { animation: bounce3 1.2s 0.3s infinite; }
        ::-webkit-scrollbar { width: 5px; height: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #6c47ff55; border-radius: 4px; }
      `}</style>

      <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* TOP BAR */}
        <div className="flex items-center gap-2 px-4 flex-shrink-0 border-b" style={{ background: panelBg, borderColor, height: 52, zIndex: 20 }}>
          <button onClick={() => navigate("/student/practice/intro-js")} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-gray-100" style={{ color: mutedColor }}>← Back</button>
          <div className="w-px h-4" style={{ background: borderColor }} />
          <span className="text-sm font-bold" style={{ color: textColor, fontFamily: "'Syne', sans-serif" }}>Color Picker</span>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200">Easy</span>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-600 border-amber-200">IN PROGRESS</span>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold px-3 py-1.5 rounded-lg" style={{ background: darkMode ? "#1a1a2e" : "#f3f4f6", color: mutedColor }}>⏱ {formatTime(elapsed)}</div>
          <button onClick={() => setDarkMode(!darkMode)} className="w-8 h-8 flex items-center justify-center rounded-lg border text-sm" style={{ borderColor }}>{darkMode ? "☀️" : "🌙"}</button>
          <button onClick={() => setFullscreen(!fullscreen)} className="w-8 h-8 flex items-center justify-center rounded-lg border text-sm" style={{ borderColor, color: mutedColor }}>{fullscreen ? "⊡" : "⛶"}</button>
          <button onClick={downloadCode} className="w-8 h-8 flex items-center justify-center rounded-lg border text-sm" style={{ borderColor, color: mutedColor }}>⬇</button>
          <div className="w-px h-4" style={{ background: borderColor }} />
          <button onClick={() => setRightPanel("preview")} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white active:scale-95 transition-all" style={{ background: "linear-gradient(135deg,#6c47ff,#7c5cfc)" }}>▶ Run</button>
          <button onClick={handleSubmit} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white active:scale-95 transition-all" style={{ background: "linear-gradient(135deg,#3cc68a,#10b981)" }}>✓ Submit</button>
        </div>

        {submitted && (
          <div className="text-center py-2.5 text-white text-xs font-bold flex-shrink-0 flex items-center justify-center gap-2" style={{ background: "linear-gradient(90deg,#3cc68a,#6c47ff)" }}>
            🎉 Submitted! {passCount}/{testCases.length} tests passed — Amazing work!
          </div>
        )}

        {/* THREE PANELS */}
        <div ref={containerRef} className="flex-1 flex overflow-hidden min-h-0">
          {/* LEFT - Description */}
          {!fullscreen && (
            <>
              <div className="flex-shrink-0 border-r flex flex-col overflow-hidden" style={{ width: `${leftWidth}%`, minWidth: 240, background: panelBg, borderColor }}>
                <div className="flex-shrink-0 p-3" style={{ background: "linear-gradient(135deg,#bb6bd9 0%,#56ccf2 55%,#6fcf97 100%)" }}>
                  <div className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)" }}>
                    <div className="flex gap-1.5 mb-2">{["#ff5f56","#ffbd2e","#27c93f"].map(c => <span key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />)}</div>
                    <p className="text-xs font-bold text-gray-800 mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Color Picker</p>
                    <div className="flex gap-1.5 justify-center mb-2">{COLORS.map(c => <div key={c} className="rounded-lg border border-black/10 flex flex-col items-center justify-end" style={{ background: c, width: 38, height: 38, paddingBottom: 2 }}><span className="text-[6px] font-bold text-gray-700 font-mono leading-none">{c}</span></div>)}</div>
                    <p className="text-[10px] text-gray-600">Background: <span className="font-bold font-mono text-[#6c47ff]">#6fcf97</span></p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5"><div className="w-5 h-5 rounded-lg bg-gradient-to-br from-[#6c47ff] to-[#7c5cfc] flex items-center justify-center text-[10px]">📋</div><h3 className="text-[13px] font-bold" style={{ color: textColor, fontFamily: "'Syne', sans-serif" }}>Description</h3></div>
                    <p className="text-[12px] leading-relaxed pl-7" style={{ color: mutedColor }}>Build a Color Picker using HTML, CSS and JavaScript. Clicking a color swatch changes the page background and shows the hex code.</p>
                  </div>
                  <div className="h-px" style={{ background: borderColor }} />
                  <div>
                    <div className="flex items-center gap-2 mb-1.5"><div className="w-5 h-5 rounded-lg bg-gradient-to-br from-[#ea580c] to-[#f97316] flex items-center justify-center text-[10px]">📝</div><h3 className="text-[13px] font-bold" style={{ color: textColor, fontFamily: "'Syne', sans-serif" }}>Instructions</h3></div>
                    <div className="space-y-2">{INSTRUCTIONS.map((inst, i) => <div key={i} className="flex items-start gap-2"><span className="flex-shrink-0 w-[17px] h-[17px] rounded-full flex items-center justify-center text-[8px] font-bold text-white mt-0.5" style={{ background: "linear-gradient(135deg,#ea580c,#f97316)" }}>{i+1}</span><span className="text-[11.5px] leading-relaxed" style={{ color: mutedColor }}>{inst}</span></div>)}</div>
                  </div>
                  <div className="h-px" style={{ background: borderColor }} />
                  <div>
                    <div className="flex items-center gap-2 mb-1.5"><div className="w-5 h-5 rounded-lg bg-gradient-to-br from-[#3cc68a] to-[#10b981] flex items-center justify-center text-[10px]">🎨</div><h3 className="text-[13px] font-bold" style={{ color: textColor, fontFamily: "'Syne', sans-serif" }}>Resources</h3></div>
                    <p className="text-[11px] mb-2" style={{ color: mutedColor }}>Font: <strong style={{ color: textColor }}>Roboto</strong></p>
                    <div className="flex flex-wrap gap-1.5">{COLORS.map(c => <div key={c} className="flex items-center gap-1 px-2 py-1 rounded-lg border text-[10.5px] font-mono font-bold" style={{ borderColor, background: inputBg, color: textColor }}><span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ background: c }} />{c}</div>)}</div>
                  </div>
                  <div className="h-px" style={{ background: borderColor }} />
                  {showTests ? (
                    <div>
                      <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><div className="w-5 h-5 rounded-lg bg-gradient-to-br from-[#6c47ff] to-[#3cc68a] flex items-center justify-center text-[10px]">🧪</div><h3 className="text-[13px] font-bold" style={{ color: textColor, fontFamily: "'Syne', sans-serif" }}>Test Cases</h3></div><span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: passCount===testCases.length?"#dcfce7":"#fef3c7", color: passCount===testCases.length?"#15803d":"#d97706" }}>{passCount}/{testCases.length}</span></div>
                      <div className="space-y-1">{testCases.map((tc,i) => <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border" style={{ background: tc.pass?"#f0fdf4":"#fef2f2", color: tc.pass?"#15803d":"#dc2626", borderColor: tc.pass?"#bbf7d0":"#fecaca" }}><span>{tc.pass?"✅":"❌"}</span>{tc.name}</div>)}</div>
                      <button onClick={()=>{setShowTests(false);setTestCases([]);}} className="text-[10px] mt-1.5 px-2 py-0.5 rounded" style={{ color: mutedColor }}>Hide</button>
                    </div>
                  ) : (
                    <button onClick={runTests} className="w-full text-[12px] font-semibold py-2.5 rounded-xl border-2 border-dashed transition-colors" style={{ color: "#6c47ff", borderColor: "#6c47ff", background: "transparent" }}>🧪 Run Test Cases</button>
                  )}
                </div>
              </div>
              {/* SMOOTH LEFT DIVIDER */}
              <div className="flex-shrink-0 cursor-col-resize hover:bg-[#6c47ff]/30 transition-all flex items-center justify-center group" style={{ width: 6, background: "transparent" }} onMouseDown={onMouseDownLeft}>
                <div className="w-[2px] h-8 rounded-full bg-[#d1d5db] group-hover:bg-[#6c47ff] group-hover:h-12 transition-all"></div>
              </div>
            </>
          )}

          {/* CENTER - Code Editor (FIXED, fills remaining space) */}
          <div className="flex-1 flex flex-col overflow-hidden" style={{ minWidth: 350, background: "#1e1e1e" }}>
            <div className="flex items-center flex-shrink-0 border-b" style={{ background: "#252526", borderColor: "#1a1a1a", height: 40 }}>
              {tabs.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)} className="tab-btn flex items-center gap-2 px-5 h-full text-[12.5px] font-semibold border-b-2" style={{ borderBottomColor: activeTab===t.key?"#6c47ff":"transparent", color: activeTab===t.key?"#ffffff":"#858585", background: activeTab===t.key?"rgba(255,255,255,0.04)":"transparent" }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: t.color }} />{t.label}
                </button>
              ))}
              <div className="flex-1" />
              <button onClick={() => navigator.clipboard.writeText(code[activeTab])} className="px-3 h-full text-[#858585] hover:text-white transition-colors text-xs">⎘ Copy</button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Editor height="100%" language={tabs.find(t=>t.key===activeTab)?.lang||"html"} theme="vs-dark" value={code[activeTab]} onChange={(val) => setCode({...code,[activeTab]:val||""})}
                options={{ fontSize: 15, fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace", fontLigatures: true, lineHeight: 26, minimap: { enabled: false }, lineNumbers: "on", lineNumbersMinChars: 3, renderLineHighlight: "all", scrollBeyondLastLine: false, cursorBlinking: "smooth", bracketPairColorization: { enabled: true }, autoClosingBrackets: "always", autoClosingQuotes: "always", autoClosingTags: "always", autoIndent: "full", formatOnPaste: true, tabSize: 2, wordWrap: "off",scrollBeyondLastLine: false,scrollBeyondLastColumn: 10,
                padding: { top: 16, bottom: 16 }, folding: true, smoothScrolling: true }} />
            </div>
            <div className="flex items-center justify-between px-4 flex-shrink-0 text-white text-[11px] font-mono" style={{ background: "#007acc", height: 24 }}>
              <span>Ln {code[activeTab].split("\n").length} · Spaces: 2 · UTF-8 · {activeTab.toUpperCase()}</span>
              <span className="opacity-60">Ctrl+Enter → Preview · F11 Fullscreen</span>
            </div>
          </div>

          {/* RIGHT - AI/Preview */}
          {!fullscreen && (
            <>
              {/* SMOOTH RIGHT DIVIDER */}
              <div className="flex-shrink-0 cursor-col-resize hover:bg-[#6c47ff]/30 transition-all flex items-center justify-center group" style={{ width: 6, background: "transparent" }} onMouseDown={onMouseDownRight}>
                <div className="w-[2px] h-8 rounded-full bg-[#d1d5db] group-hover:bg-[#6c47ff] group-hover:h-12 transition-all"></div>
              </div>

              <div className="flex-shrink-0 flex flex-col border-l overflow-hidden" style={{ width: `${rightWidth}%`, minWidth: 240, background: panelBg, borderColor }}>
                <div className="flex-shrink-0 border-b flex items-center justify-center p-3" style={{ background: panelBg2, borderColor }}>
                  <div className="flex rounded-xl p-1 gap-1" style={{ background: darkMode?"#1a1a30":"#e5e7eb" }}>
                    <button onClick={() => setRightPanel("ai")} className="panel-btn flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold" style={{ background: rightPanel==="ai"?"linear-gradient(135deg,#6c47ff,#7c5cfc)":"transparent", color: rightPanel==="ai"?"#fff":mutedColor, boxShadow: rightPanel==="ai"?"0 2px 8px #6c47ff44":"none" }}>🤖 Zara AI</button>
                    <button onClick={() => setRightPanel("preview")} className="panel-btn flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold" style={{ background: rightPanel==="preview"?"linear-gradient(135deg,#6c47ff,#7c5cfc)":"transparent", color: rightPanel==="preview"?"#fff":mutedColor, boxShadow: rightPanel==="preview"?"0 2px 8px #6c47ff44":"none" }}>🖥️ Preview</button>
                  </div>
                </div>
                {rightPanel === "ai" && (
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b" style={{ borderColor, background: panelBg2 }}>
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "linear-gradient(135deg,#6c47ff,#3cc68a)", animation: "pulse-dot 2.5s infinite" }}>🤖</div>
                      <div><p className="text-[13px] font-bold" style={{ color: textColor, fontFamily: "'Syne', sans-serif" }}>Zara</p><p className="text-[10px] flex items-center gap-1" style={{ color: "#3cc68a" }}><span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: "pulse-dot 1.4s infinite" }} />AI Tutor · Always here</p></div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                      {messages.map((msg, i) => (
                        <div key={i} className={`chat-msg flex gap-2 ${msg.role==="user"?"flex-row-reverse":"flex-row"}`}>
                          {msg.role==="ai" && <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center text-sm mt-0.5" style={{ background: "linear-gradient(135deg,#6c47ff,#3cc68a)" }}>🤖</div>}
                          <div className="max-w-[82%] px-4 py-3 text-[14px] leading-relaxed" style={{ background: msg.role==="user"?"linear-gradient(135deg,#6c47ff,#7c5cfc)":darkMode?"#1a1a2e":"#f3f4f6", color: msg.role==="user"?"#fff":textColor, borderRadius: msg.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px" }}>{renderMd(msg.text)}</div>
                        </div>
                      ))}
                      {aiTyping && (
  <div className="chat-msg flex gap-2">
    <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center text-sm" style={{ background: "linear-gradient(135deg,#6c47ff,#3cc68a)" }}>🤖</div>
    <div className="flex flex-col gap-2" style={{ background: darkMode ? "#1a1a2e" : "#f3f4f6", borderRadius: "16px 16px 16px 4px", padding: "14px 16px", minWidth: 180 }}>
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-semibold" style={{ color: "#6c47ff" }}>Analyzing code</span>
        <span className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full d1" style={{ background: "#6c47ff" }} />
          <span className="w-1.5 h-1.5 rounded-full d2" style={{ background: "#6c47ff" }} />
          <span className="w-1.5 h-1.5 rounded-full d3" style={{ background: "#6c47ff" }} />
        </span>
      </div>
      <div className="flex items-center gap-2 text-[11px] font-medium" style={{ color: mutedColor }}>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold text-white" style={{ background: "#e44d26" }}>H</span>
          <span style={{ color: aiStep >= 1 ? "#e44d26" : mutedColor }}>HTML</span>
          {aiStep >= 1 && <span className="text-emerald-400">✓</span>}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold text-white" style={{ background: "#264de4" }}>C</span>
          <span style={{ color: aiStep >= 2 ? "#264de4" : mutedColor }}>CSS</span>
          {aiStep >= 2 && <span className="text-emerald-400">✓</span>}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold text-white" style={{ background: "#f7df1e" }}>J</span>
          <span style={{ color: aiStep >= 3 ? "#f7df1e" : mutedColor }}>JS</span>
          {aiStep >= 3 && <span className="text-emerald-400">✓</span>}
        </span>
      </div>
    </div>
  </div>
)}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="flex flex-wrap gap-1.5 px-3 pt-2 pb-1 flex-shrink-0 border-t" style={{ borderColor }}>{["Help with HTML","Fix my JS","CSS tips","Run tests"].map(s => <button key={s} onClick={()=>{setChatInput(s);}} className="suggestion-chip text-[10px] px-2.5 py-1 rounded-full border font-semibold transition-all" style={{ borderColor, color: mutedColor, background: "transparent" }}>{s}</button>)}</div>
                    <div className="flex gap-2 p-3 flex-shrink-0 border-t" style={{ borderColor }}>
                      <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Ask Zara anything…" className="flex-1 px-4 py-3 rounded-xl border text-[15px] outline-none transition-colors" style={{ background: inputBg, borderColor, color: textColor }} onFocus={e=>e.target.style.borderColor="#6c47ff"} onBlur={e=>e.target.style.borderColor=borderColor} />
                      <button onClick={sendChat} className="w-9 h-9 flex items-center justify-center rounded-xl text-white text-sm active:scale-95 transition-all" style={{ background: "linear-gradient(135deg,#6c47ff,#7c5cfc)" }}>↑</button>
                    </div>
                  </div>
                )}
                {rightPanel === "preview" && (
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 flex-shrink-0 border-b" style={{ background: panelBg2, borderColor }}>
                      <div className="flex gap-1.5">{["#ff5f56","#ffbd2e","#27c93f"].map(c=><span key={c} className="w-2.5 h-2.5 rounded-full" style={{background:c}}/>)}</div>
                      <div className="flex-1 text-[10px] font-mono px-2 py-1 rounded-lg" style={{ background: darkMode?"#0a0a15":"#fff", color: mutedColor, border: `1px solid ${borderColor}` }}>color-picker.html</div>
                      <span className="text-[9px] font-semibold text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{animation:"pulse-dot 1.4s infinite"}}/>LIVE</span>
                    </div>
                    <div className="flex-1 overflow-hidden"><iframe srcDoc={livePreviewSrc} className="w-full h-full border-0" title="Live Preview" sandbox="allow-scripts" style={{background:"#fff"}}/></div>
                    <div className="px-3 py-1.5 text-[10px] text-center flex-shrink-0" style={{ color: mutedColor, borderTop: `1px solid ${borderColor}`, background: panelBg2 }}>✨ Auto-updates as you type</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}