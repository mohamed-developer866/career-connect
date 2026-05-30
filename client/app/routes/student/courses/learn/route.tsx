import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import Sidebar from "../../../../components/Sidebar";
import Editor from "@monaco-editor/react";

export default function CourseLearn() {
  var { courseId } = useParams();
  var navigate = useNavigate();
  var [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  var [course, setCourse] = useState<any>(null);
  var [modules, setModules] = useState<any[]>([]);
  var [activeModule, setActiveModule] = useState<any>(null);
  var [activeTopic, setActiveTopic] = useState<any>(null);
  var [progress, setProgress] = useState<any[]>([]);
  var [loading, setLoading] = useState(true);
  var [markingComplete, setMarkingComplete] = useState(false);
  var [codeValue, setCodeValue] = useState('');
  var [previewHtml, setPreviewHtml] = useState('');
  var [rightPanel, setRightPanel] = useState("output");
  var [chatInput, setChatInput] = useState("");
  var [aiMessages, setAiMessages] = useState([{ role: "ai", text: "👋 Hi! I'm **Zara**, your AI coding tutor! Ask me anything about your code — I can debug, explain, and even rewrite it for you! ✨" }]);
  var [aiLoading, setAiLoading] = useState(false);
  var [showConfetti, setShowConfetti] = useState(false);
  var [videoSize, setVideoSize] = useState("normal"); // "small" | "normal" | "full"
  var chatEndRef = useRef<any>(null);

  useEffect(function() {
    if (activeTopic?.codeTemplate) { setCodeValue(activeTopic.codeTemplate); setPreviewHtml(''); }
  }, [activeTopic]);

  useEffect(function() { loadCourse(); }, []);

  var loadCourse = async function() {
    try {
      var token = localStorage.getItem("token");
      var res = await fetch("http://localhost:5000/api/learning/courses/" + courseId, {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) {
        var data = await res.json();
        setCourse(data.course);
        setModules(data.course.modules || []);
        if (data.course.modules && data.course.modules.length > 0) {
          setActiveModule(data.course.modules[0]);
          if (data.course.modules[0].topics && data.course.modules[0].topics.length > 0) {
            setActiveTopic(data.course.modules[0].topics[0]);
          }
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  var markComplete = async function(topicId: string) {
    setMarkingComplete(true);
    try {
      var token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/learning/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ topicId: topicId, moduleId: activeModule?.id, courseId: courseId })
      });
      setShowConfetti(true);
      setTimeout(function() { setShowConfetti(false); }, 2000);
      await loadCourse();
    } catch (err) { console.error(err); }
    finally { setMarkingComplete(false); }
  };

  var isCompleted = function(topicId: string) {
    return progress.some(function(p: any) { return p.topicId === topicId && p.completed; });
  };

  var getCompletedCount = function() {
    var total = 0;
    for (var i = 0; i < modules.length; i++)
      for (var j = 0; j < modules[i].topics.length; j++)
        if (isCompleted(modules[i].topics[j].id)) total++;
    return total;
  };

  var getTotalTopics = function() {
    var total = 0;
    for (var i = 0; i < modules.length; i++) total += modules[i].topics.length;
    return total;
  };

  var updatePreview = function() {
    try {
      var escapedCode = codeValue.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
      var htmlOutput = '<!DOCTYPE html><html><head><meta charset="UTF-8"><script src="https://unpkg.com/react@18/umd/react.development.js"><\/script><script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script><script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}.card{background:#fff;border-radius:20px;padding:40px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);max-width:450px}.card h1{font-size:48px;font-weight:800;background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.card button{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;padding:14px 36px;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;margin:5px}</style></head><body><div id="root"></div><script type="text/babel">try{'+escapedCode+'}catch(e){document.getElementById("root").innerHTML="<div style=\\"color:red;text-align:center;padding:40px\\">Error: "+e.message+"</div>"}<\/script></body></html>';
      setPreviewHtml(htmlOutput);
    } catch (err: any) {
      setPreviewHtml('<div style="padding:40px;color:#dc2626;text-align:center">Error: ' + err.message + '</div>');
    }
  };

  var askAI = async function() {
    if (!chatInput.trim() || aiLoading) return;
    var question = chatInput.trim();
    setAiMessages(function(prev: any) { return [...prev, { role: "user", text: question }]; });
    setChatInput("");
    setAiLoading(true);
    setRightPanel("ai");
    try {
      var token = localStorage.getItem("token");
      var res = await fetch("http://localhost:5000/api/chatbot/zara-code", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ message: question, code: { html: "", css: "", js: codeValue } })
      });
      if (res.ok) {
        var data = await res.json();
        setAiMessages(function(prev: any) { return [...prev, { role: "ai", text: data.message || "I analyzed your code!" }]; });
        if (data.code && data.code.js) {
          setCodeValue(data.code.js);
          setTimeout(function() { updatePreview(); }, 300);
        }
      }
    } catch (err) {}
    finally { setAiLoading(false); }
  };

  var renderMessage = function(text: string) {
    return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map(function(part, i) {
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={i} style={{ color: "#6c47ff" }}>{part.slice(2, -2)}</strong>;
      if (part.startsWith("`") && part.endsWith("`"))
        return <code key={i} style={{ background: "#f0f4ff", color: "#6c47ff", padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>{part.slice(1, -1)}</code>;
      return <span key={i}>{part}</span>;
    });
  };

  var formatCheatsheet = function(text: string) {
    if (!text) return '';
    var html = text;
    html = html.replace(/```(\w+)?\n?([\s\S]*?)```/g, function(m: any, lang: any, code: any) {
      return '<div class="code-block"><div class="code-header"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span><span class="lang-tag">' + (lang || 'code') + '</span></div><pre><code>' + code.trim().replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</code></pre></div>';
    });
    html = html.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');
    html = html.replace(/^### (.+)$/gm, '<h3 class="cheatsheet-h3">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="cheatsheet-h2">$1</h2>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="cheatsheet-bold">$1</strong>');
    html = html.replace(/^- (.+)$/gm, '<li><span class="bullet">◆</span>$1</li>');
    html = html.replace(/(<li>.*?<\/li>\s*)+/g, '<ul class="cheatsheet-ul">$&</ul>');
    html = html.replace(/\n\n/g, '</p><p class="cheatsheet-p">');
    html = '<p class="cheatsheet-p">' + html + '</p>';
    return html;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8f9fc]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6c47ff] to-[#a78bfa] animate-pulse mx-auto mb-4 flex items-center justify-center text-2xl">⚛️</div>
          <div className="flex gap-2 justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#6c47ff] animate-bounce"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#6c47ff] animate-bounce" style={{ animationDelay: "0.15s" }}></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#6c47ff] animate-bounce" style={{ animationDelay: "0.3s" }}></div>
          </div>
          <p className="text-slate-500 text-sm mt-4">Loading your course...</p>
        </div>
      </div>
    );
  }

  var progressPercent = getTotalTopics() > 0 ? Math.round((getCompletedCount() / getTotalTopics()) * 100) : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fc]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes popIn { 0%{transform:scale(0.9);opacity:0} 80%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
        @keyframes confettiFall { 0%{transform:translateY(-10px) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
        @keyframes completePulse { 0%{transform:scale(1)} 50%{transform:scale(1.1)} 100%{transform:scale(1)} }
        
        .animate-in { animation: fadeInUp 0.5s ease forwards; }
        .pop-in { animation: popIn 0.3s ease forwards; }
        .complete-anim { animation: completePulse 0.6s ease; }
        
        .cheatsheet-h2 { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 700; color: #1a1f3c; margin: 28px 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
        .cheatsheet-h3 { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #6c47ff; margin: 20px 0 8px; }
        .cheatsheet-p { font-size: 15px; line-height: 1.8; color: #374151; margin-bottom: 10px; }
        .cheatsheet-bold { color: #1a1f3c; font-weight: 700; }
        .cheatsheet-ul { list-style: none; padding-left: 4px; margin: 12px 0; }
        .cheatsheet-ul li { display: flex; align-items: flex-start; gap: 8px; font-size: 14px; line-height: 1.8; color: #374151; margin-bottom: 6px; }
        .bullet { color: #6c47ff; font-weight: bold; margin-top: 3px; flex-shrink: 0; }
        .inline-code { background: #f0f4ff; color: #6c47ff; padding: 2px 8px; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; border: 1px solid #e0e7ff; }
        .code-block { background: #0D1B40; border-radius: 16px; overflow: hidden; margin: 20px 0; border: 1px solid #1E3264; box-shadow: 0 4px 20px rgba(13,27,64,0.15); }
        .code-header { display: flex; align-items: center; gap: 6px; padding: 12px 16px; background: #0A152E; border-bottom: 1px solid #1E3264; }
        .code-header .dot { width: 10px; height: 10px; border-radius: 50%; }
        .code-header .dot.red { background: #ff5f56; } .code-header .dot.yellow { background: #ffbd2e; } .code-header .dot.green { background: #27c93f; }
        .code-header .lang-tag { margin-left: 10px; font-size: 11px; color: #8899BB; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .code-block pre { padding: 20px; margin: 0; overflow-x: auto; }
        .code-block code { font-family: 'JetBrains Mono', monospace; font-size: 14px; line-height: 1.7; color: #e5e7eb; }
        
        .topic-active { background: linear-gradient(135deg, #6c47ff08, #6c47ff15); border-left: 3px solid #6c47ff; }
        .module-completed { background: #f0fdf4; }
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
      `}</style>

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 30 }).map(function(_, i) {
            return (
              <div key={i} style={{
                position: 'absolute', left: Math.random() * 100 + '%', top: -20,
                width: 8 + Math.random() * 8 + 'px', height: 8 + Math.random() * 8 + 'px',
                background: ['#6c47ff', '#a78bfa', '#3cc68a', '#f7df1e', '#ff6b6b'][Math.floor(Math.random() * 5)],
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                animation: 'confettiFall ' + (2 + Math.random() * 3) + 's linear forwards',
                animationDelay: Math.random() * 1 + 's'
              }}></div>
            );
          })}
        </div>
      )}

      <Sidebar user={{}} collapsed={sidebarCollapsed} onToggle={function() { setSidebarCollapsed(!sidebarCollapsed); }} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TOP BAR */}
        <div className="bg-white border-b border-[#e5e7eb] px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={function() { navigate("/student/courses"); }} className="text-[#6b7280] hover:text-[#1a1f3c] text-sm font-medium">← Back</button>
            <div className="w-px h-5 bg-[#e5e7eb]"></div>
            <span className="text-2xl">{course?.icon || "📚"}</span>
            <h1 className="text-[#1a1f3c] font-bold text-sm">{course?.title || "Course"}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6b7280]">{getCompletedCount()}/{getTotalTopics()} done</span>
            <div className="h-2.5 w-36 bg-[#e5e7eb] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#6c47ff] to-[#a78bfa] rounded-full transition-all duration-700" style={{ width: progressPercent + '%' }}></div>
            </div>
            <span className="text-sm font-extrabold text-[#6c47ff]">{progressPercent}%</span>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* LEFT - Module Navigation */}
          <div className="w-[300px] bg-white border-r border-[#e5e7eb] flex flex-col flex-shrink-0 overflow-y-auto">
            {modules.map(function(mod: any) {
              var isActive = activeModule?.id === mod.id;
              var modCompleted = mod.topics && mod.topics.every(function(t: any) { return isCompleted(t.id); });
              return (
                <div key={mod.id}>
                  <button onClick={function() { setActiveModule(mod); if (mod.topics && mod.topics[0]) setActiveTopic(mod.topics[0]); }}
                    className={"w-full text-left px-5 py-4 border-b border-[#f3f4f6] transition-all duration-200 " + (isActive ? "topic-active" : "border-l-[3px] border-l-transparent hover:bg-gray-50") + (modCompleted ? " module-completed" : "")}>
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className={"w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold " + (modCompleted ? "bg-emerald-500 text-white" : "bg-[#6c47ff]/10 text-[#6c47ff]")}>
                        {modCompleted ? "✓" : mod.orderIndex}
                      </span>
                      <span className="text-[#1a1f3c] text-[13px] font-semibold">{mod.title}</span>
                    </div>
                    <p className="text-[10px] text-[#6b7280] ml-8">{mod.duration} • {mod.topics ? mod.topics.length : 0} topics</p>
                  </button>
                  {isActive && mod.topics && mod.topics.map(function(topic: any) {
                    var completed = isCompleted(topic.id);
                    var isActiveTopic = activeTopic?.id === topic.id;
                    return (
                      <button key={topic.id} onClick={function() { setActiveTopic(topic); }}
                        className={"w-full text-left pl-14 pr-4 py-3 text-[12px] border-b border-[#f8f9fc] transition-all flex items-center gap-3 " + (isActiveTopic ? "bg-[#6c47ff]/5 text-[#6c47ff] font-semibold" : "text-[#6b7280] hover:bg-gray-50")}>
                        <span className={"w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 " + (completed ? "bg-emerald-500 text-white" : "bg-[#e5e7eb] text-[#6b7280]")}>{completed ? "✓" : topic.orderIndex}</span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{topic.title}</p>
                          <span className={"text-[9px] px-1.5 py-0.5 rounded font-medium " + (topic.contentType === "video" ? "bg-blue-50 text-blue-600" : topic.contentType === "cheatsheet" ? "bg-purple-50 text-purple-600" : "bg-amber-50 text-amber-600")}>
                            {topic.contentType === "video" ? "📹" : topic.contentType === "cheatsheet" ? "📋" : "💻"} {topic.duration}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* RIGHT - Content */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {activeTopic ? (
              <div className="flex-1 overflow-y-auto">
                {/* Topic Header */}
                <div className="bg-white border-b border-[#e5e7eb] px-8 py-5 flex items-center justify-between sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6c47ff] to-[#a78bfa] flex items-center justify-center text-white text-lg shadow-md">
                      {activeTopic?.contentType === "video" ? "📹" : activeTopic?.contentType === "cheatsheet" ? "📋" : "💻"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#6c47ff] uppercase font-bold tracking-widest bg-[#6c47ff]/10 px-2 py-0.5 rounded-full">{activeModule?.title}</span>
                        <span className="text-[10px] text-[#8899BB]">›</span>
                        <span className="text-[11px] text-[#6b7280] font-medium">{activeTopic?.duration}</span>
                      </div>
                      <h2 className="text-[#1a1f3c] text-xl font-bold mt-1" style={{ fontFamily: "'Syne', sans-serif" }}>{activeTopic.title}</h2>
                    </div>
                  </div>
                  {isCompleted(activeTopic.id) ? (
                    <span className="px-6 py-3 bg-emerald-500 text-white text-sm font-bold rounded-2xl flex items-center gap-2 pop-in shadow-lg shadow-emerald-200 complete-anim">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      Completed ✓
                    </span>
                  ) : (
                    <button onClick={function() { markComplete(activeTopic.id); }} disabled={markingComplete}
                      className="px-6 py-3 bg-[#f3f4f6] text-[#6b7280] text-sm font-bold rounded-2xl hover:bg-[#6c47ff] hover:text-white hover:shadow-lg hover:shadow-[#6c47ff]/20 transition-all duration-200">
                      {markingComplete ? "Marking..." : "✔ Mark Complete"}
                    </button>
                  )}
                </div>

                {/* VIDEO - SMALL SIZE */}
               {/* VIDEO - Fit to available space */}
{/* VIDEO - Fit to available space */}
{activeTopic.contentType === "video" && (
  <div className="animate-in">
    <div className="flex items-center justify-between px-6 py-2 bg-[#f8f9fc] border-b border-[#e5e7eb]">
      <span className="text-xs text-[#6b7280]">📹 {activeModule?.title}</span>
      <span className="text-[10px] text-[#6b7280] bg-white px-2 py-1 rounded-full border">Auto-playing</span>
    </div>
    <div className="p-4 flex justify-center">
      <div style={{ width: "92%", maxWidth: 1000 }}>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe src={"https://www.youtube.com/embed/" + (activeModule?.videoUrl || "SqcY0GlETPk") + "?autoplay=1&rel=0&modestbranding=1"}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 16 }}
            allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen></iframe>
        </div>
      </div>
    </div>
  </div>
)}

                {/* CHEATSHEET */}
                {activeTopic.contentType === "cheatsheet" && activeTopic.content && (
                  <div className="max-w-4xl mx-auto p-8">
                    <div className="bg-white rounded-3xl p-8 border border-[#e5e7eb] shadow-sm" dangerouslySetInnerHTML={{ __html: formatCheatsheet(activeTopic.content) }} />
                  </div>
                )}

                {/* CODING */}
                {activeTopic.contentType === "coding" && (
                  <div className="flex-1 flex flex-col animate-in">
                    <div className="flex-1 flex">
                      <div className="flex-1 flex flex-col border-r border-[#e5e7eb]">
                        <div className="bg-[#1e1e1e] px-4 py-2 flex items-center gap-2 border-b border-[#333]">
                          <span className="w-3 h-3 rounded-full bg-[#ff5f56]"></span>
                          <span className="w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
                          <span className="w-3 h-3 rounded-full bg-[#27c93f]"></span>
                          <span className="ml-3 text-[#858585] text-xs font-mono">App.jsx</span>
                        </div>
                        <div style={{ flex: 1, minHeight: '400px' }}>
                          <Editor height="100%" defaultLanguage="javascript" theme="vs-dark" value={codeValue}
                            onChange={function(val: any) { setCodeValue(val || ''); }}
                            options={{ fontSize: 15, fontFamily: "'JetBrains Mono', monospace", minimap: { enabled: false }, lineNumbers: 'on', padding: { top: 16 }, tabSize: 2, scrollBeyondLastLine: false }} />
                        </div>
                      </div>
                      <div className="w-[42%] flex flex-col bg-white">
                        <div className="flex border-b border-[#e5e7eb] bg-[#f8f9fc]">
                          <button onClick={function() { setRightPanel("output"); }}
                            className={"flex-1 py-3 text-xs font-bold transition-all " + (rightPanel === "output" ? "text-[#6c47ff] border-b-2 border-[#6c47ff] bg-white" : "text-[#6b7280] hover:text-[#1a1f3c]")}>
                            🖥️ Output
                          </button>
                          <button onClick={function() { setRightPanel("ai"); }}
                            className={"flex-1 py-3 text-xs font-bold transition-all " + (rightPanel === "ai" ? "text-[#6c47ff] border-b-2 border-[#6c47ff] bg-white" : "text-[#6b7280] hover:text-[#1a1f3c]")}>
                            🤖 Zara AI
                          </button>
                        </div>
                        {rightPanel === "output" && (
                          <div className="flex-1 p-0">
                            <iframe srcDoc={previewHtml} style={{ width: '100%', height: '100%', border: 'none' }} sandbox="allow-scripts" />
                          </div>
                        )}
                        {rightPanel === "ai" && (
                          <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-gradient-to-r from-[#6c47ff]/5 to-[#a78bfa]/5 flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6c47ff] to-[#a78bfa] flex items-center justify-center text-sm">🤖</div>
                              <div>
                                <p className="text-xs font-bold text-[#1a1f3c]">Zara AI</p>
                                <p className="text-[10px] text-[#6b7280]">Coding Assistant</p>
                              </div>
                              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                              {aiMessages.map(function(msg: any, i: number) {
                                return (
                                  <div key={i} className={"flex gap-2 " + (msg.role === "user" ? "flex-row-reverse" : "")}>
                                    {msg.role === "ai" && <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6c47ff] to-[#a78bfa] flex items-center justify-center text-xs flex-shrink-0 mt-1">🤖</div>}
                                    <div className={"max-w-[85%] px-3 py-2.5 text-[13px] leading-relaxed " + (msg.role === "user" ? "bg-[#6c47ff] text-white rounded-2xl rounded-br-md" : "bg-[#f3f4f6] text-[#1a1f3c] rounded-2xl rounded-bl-md")}>
                                      {renderMessage(msg.text)}
                                    </div>
                                  </div>
                                );
                              })}
                              {aiLoading && (
                                <div className="flex gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6c47ff] to-[#a78bfa] flex items-center justify-center text-xs">🤖</div>
                                  <div className="bg-[#f3f4f6] rounded-2xl rounded-bl-md px-4 py-3">
                                    <div className="flex gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-[#6c47ff] animate-bounce"></span>
                                      <span className="w-2 h-2 rounded-full bg-[#6c47ff] animate-bounce" style={{ animationDelay: "0.15s" }}></span>
                                      <span className="w-2 h-2 rounded-full bg-[#6c47ff] animate-bounce" style={{ animationDelay: "0.3s" }}></span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div ref={chatEndRef} />
                            </div>
                            <div className="flex gap-2 p-3 border-t border-[#e5e7eb]">
                              <input value={chatInput} onChange={function(e: any) { setChatInput(e.target.value); }} onKeyDown={function(e: any) { if (e.key === "Enter") askAI(); }}
                                placeholder="Ask Zara about your code..." className="flex-1 px-3 py-2.5 rounded-xl border border-[#e5e7eb] text-sm outline-none focus:border-[#6c47ff] transition-colors" />
                              <button onClick={askAI} disabled={aiLoading} className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#6c47ff] text-white text-sm hover:bg-[#5a3de0] transition-colors disabled:opacity-50">↑</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bg-white border-t border-[#e5e7eb] px-6 py-3 flex items-center gap-3 flex-shrink-0">
                      <button onClick={updatePreview} className="px-6 py-2.5 bg-[#6c47ff] text-white text-sm font-bold rounded-xl hover:bg-[#5a3de0] transition-all shadow-md flex items-center gap-2"><span>▶</span> Run Code</button>
                      <button onClick={function() { setCodeValue(activeTopic.codeTemplate || ''); setPreviewHtml(''); }} className="px-6 py-2.5 bg-white border border-[#e5e7eb] text-[#1a1f3c] text-sm font-bold rounded-xl hover:bg-gray-50 transition-all">↺ Reset</button>
                      <span className="text-[10px] text-[#6b7280] ml-auto">▶ Run · 🤖 Ask AI for help</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center animate-in">
                  <span className="text-7xl block mb-6">📚</span>
                  <h2 className="text-2xl font-extrabold text-[#1a1f3c] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Start Learning</h2>
                  <p className="text-[#6b7280] text-lg">Select a topic from the left sidebar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}