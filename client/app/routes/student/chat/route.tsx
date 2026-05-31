import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router";
import { askAI } from "../../../lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Sidebar from "../../../components/Sidebar";

const suggestedQuestions = [
  { text: "How can I improve my resume?", icon: "📄", category: "Resume", color: "from-blue-400 to-blue-500" },
  { text: "Which jobs match my skills?", icon: "🎯", category: "Job Match", color: "from-purple-400 to-purple-500" },
  { text: "How to prepare for technical interviews?", icon: "💻", category: "Interview", color: "from-emerald-400 to-emerald-500" },
  { text: "What skills should I learn next?", icon: "📈", category: "Skills", color: "from-amber-400 to-amber-500" },
  { text: "Review my career roadmap", icon: "🗺️", category: "Career", color: "from-rose-400 to-rose-500" },
];

const quickReplies = [
  "Tell me about your skills",
  "Suggest a learning path",
  "Mock interview tips",
  "Salary negotiation",
];

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
};

export default function AIChat() {
  const { user } = useOutletContext<any>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: `Hello ${user?.fullName?.split(" ")[0] || "there"}! 👋 I'm your AI Career Guide. I specialize in resume reviews, job matching, interview preparation, and career planning. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    
    setShowSuggestions(false);
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await askAI(text);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "I apologize, but I'm having trouble connecting. Please check your internet connection and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "ai",
        content: `Hello ${user?.fullName?.split(" ")[0] || "there"}! 👋 I'm your AI Career Guide. How can I assist you with your career journey today?`,
        timestamp: new Date(),
      },
    ]);
    setShowSuggestions(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Syne:wght@600;700;800&display=swap');
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes rainbow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes typingPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        .message-user {
          animation: slideInRight 0.3s cubic-bezier(0.34, 1.2, 0.64, 1) both;
        }
        
        .message-ai {
          animation: slideInLeft 0.3s cubic-bezier(0.34, 1.2, 0.64, 1) both;
        }
        
        .suggestion-card {
          animation: fadeIn 0.4s ease both;
          transition: all 0.2s ease;
        }
        
        .suggestion-card:hover {
          transform: translateY(-3px) scale(1.02);
        }
        
        .typing-indicator span {
          animation: typingPulse 1.4s infinite;
        }
        
        .rainbow-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          background-size: 200% 200%;
          animation: rainbow 3s ease infinite;
        }
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 10px; }
      `}</style>
      
      <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Premium Colorful Header */}
        <div className="rainbow-bg px-6 py-4 flex-shrink-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl shadow-lg">
                  🤖
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                  AI Career Guide
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                  <p className="text-xs text-white/90 font-medium">Powered by DeepSeek AI • 24/7 Available</p>
                </div>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="px-4 py-2 text-xs font-medium text-purple-600 bg-white rounded-lg hover:bg-purple-50 transition-all flex items-center gap-2 shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              New Chat
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Chat Panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-white to-purple-50/20">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} ${msg.role === "user" ? "message-user" : "message-ai"}`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {/* AI Avatar */}
                  {msg.role === "ai" && (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg flex-shrink-0 mr-3 shadow-lg">
                      🤖
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className="max-w-[75%]">
                    <div
                      className={`px-5 py-3 text-sm leading-relaxed shadow-md ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl rounded-tr-sm"
                          : "bg-white text-slate-700 rounded-2xl rounded-tl-sm border border-purple-100"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <div className="whitespace-pre-line">{msg.content}</div>
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }) => (
                              <h1 className="text-lg font-bold text-purple-700 mb-2 mt-3 first:mt-0 pb-1 border-b border-purple-100">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-base font-bold text-purple-600 mb-2 mt-3">{children}</h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-sm font-semibold text-slate-700 mb-1.5 mt-2">{children}</h3>
                            ),
                            p: ({ children }) => (
                              <p className="mb-2 text-sm leading-relaxed text-slate-600">{children}</p>
                            ),
                            ul: ({ children }) => (
                              <ul className="space-y-1 mb-2">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal pl-4 space-y-1 mb-2 marker:text-purple-500 marker:font-semibold">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="flex items-start gap-1.5 text-sm text-slate-600 leading-relaxed">
                                <span className="text-purple-500 mt-1 flex-shrink-0">•</span>
                                <span>{children}</span>
                              </li>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-slate-800">{children}</strong>
                            ),
                            code: ({ children, className }) => {
                              const isInline = !className;
                              return isInline ? (
                                <code className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-md text-xs font-medium">
                                  {children}
                                </code>
                              ) : (
                                <code className="block bg-slate-800 text-purple-400 p-3 rounded-lg text-xs overflow-x-auto my-2 font-mono">
                                  {children}
                                </code>
                              );
                            },
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-3 border-purple-400 pl-3 italic text-slate-500 my-2 bg-purple-50/30 py-1 pr-2 rounded-r-md text-sm">
                                {children}
                              </blockquote>
                            ),
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                className="text-purple-600 underline decoration-dotted underline-offset-2 hover:text-purple-700 transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            ),
                            hr: () => <hr className="border-purple-100 my-3" />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                    
                    {/* Timestamp */}
                    <div className={`flex items-center gap-1 mt-1 px-1 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <span className="text-[9px] text-slate-400">{formatTime(msg.timestamp)}</span>
                      {msg.role === "user" && (
                        <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {msg.role === "user" && (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ml-3 shadow-lg">
                      {user?.fullName?.charAt(0) || "S"}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <div className="flex justify-start message-ai">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg flex-shrink-0 mr-3 shadow-lg">
                    🤖
                  </div>
                  <div className="bg-white rounded-2xl px-5 py-3 shadow-md border border-purple-100">
                    <div className="flex gap-1.5 typing-indicator">
                      <span className="w-2 h-2 rounded-full bg-purple-400" style={{ animationDelay: "0s" }}></span>
                      <span className="w-2 h-2 rounded-full bg-purple-400" style={{ animationDelay: "0.15s" }}></span>
                      <span className="w-2 h-2 rounded-full bg-purple-400" style={{ animationDelay: "0.3s" }}></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Input Area - Colorful */}
            <div className="bg-white/95 backdrop-blur-md border-t border-purple-100 px-5 py-3 flex-shrink-0 shadow-lg">
              {/* Quick Replies - Colorful */}
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                {quickReplies.map((reply, idx) => {
                  const colors = [
                    "from-blue-400 to-blue-500",
                    "from-purple-400 to-purple-500", 
                    "from-pink-400 to-pink-500",
                    "from-emerald-400 to-emerald-500"
                  ];
                  return (
                    <button
                      key={reply}
                      onClick={() => sendMessage(reply)}
                      disabled={loading}
                      className={`px-3 py-1.5 text-[10px] font-medium text-white bg-gradient-to-r ${colors[idx % colors.length]} rounded-full hover:shadow-lg transition-all whitespace-nowrap disabled:opacity-50`}
                    >
                      {reply}
                    </button>
                  );
                })}
              </div>
              
              {/* Input Box */}
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                    placeholder="Ask me anything about your career..."
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-purple-200 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 disabled:opacity-50 transition-all placeholder:text-purple-400"
                  />
                </div>
                <button
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  className="w-11 h-11 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              
              {/* Footer Note */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="w-1 h-1 rounded-full bg-purple-400"></span>
                <p className="text-[9px] text-purple-500 text-center font-medium">
                  ✨ AI responses are generated by DeepSeek • Career guidance only ✨
                </p>
                <span className="w-1 h-1 rounded-full bg-purple-400"></span>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Suggestions & Resources (Colorful) */}
          <div className="w-80 bg-gradient-to-b from-white to-purple-50/50 backdrop-blur-sm border-l border-purple-100 flex flex-col flex-shrink-0 overflow-y-auto hidden lg:flex">
            <div className="p-5 space-y-5">
              {/* Welcome Card */}
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">✨</span>
                  <h3 className="text-sm font-bold">Welcome to AI Guide!</h3>
                </div>
                <p className="text-xs text-white/90">Get personalized career advice, resume tips, and job matching assistance.</p>
              </div>

              {/* Suggested Questions - Colorful */}
              {showSuggestions && (
                <div>
                  <h3 className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="text-base">💡</span> Suggested Questions
                  </h3>
                  <div className="space-y-2">
                    {suggestedQuestions.map((q, idx) => (
                      <button
                        key={q.text}
                        onClick={() => sendMessage(q.text)}
                        disabled={loading}
                        className={`suggestion-card w-full flex items-center justify-between px-3 py-2.5 bg-white rounded-xl text-sm text-slate-700 hover:shadow-lg transition-all border-l-4 border-${q.color.split(' ')[1]} disabled:opacity-50`}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{q.icon}</span>
                          <div className="text-left">
                            <p className="text-xs font-medium">{q.text}</p>
                            <p className="text-[9px] text-purple-500">{q.category}</p>
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Resources - Colorful */}
              <div>
                <h3 className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="text-base">📚</span> Quick Resources
                </h3>
                <div className="space-y-2">
                  {[
                    { name: "Resume Templates", icon: "📄", color: "from-blue-400 to-blue-500" },
                    { name: "Interview Guides", icon: "🎯", color: "from-purple-400 to-purple-500" },
                    { name: "Skill Assessments", icon: "📊", color: "from-pink-400 to-pink-500" },
                  ].map((resource) => (
                    <button
                      key={resource.name}
                      onClick={() => sendMessage(`Tell me about ${resource.name}`)}
                      className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r ${resource.color} rounded-lg text-xs text-white font-medium hover:shadow-lg transition-all`}
                    >
                      <span>{resource.icon}</span>
                      {resource.name}
                      <svg className="w-3 h-3 ml-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tips Card - Colorful */}
              <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl p-4 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💎</span>
                  <h3 className="text-xs font-bold text-amber-800">Pro Tip</h3>
                </div>
                <p className="text-[10px] text-amber-700 leading-relaxed">
                  Be specific with your questions! The more details you share about your skills and goals, the better advice I can provide.
                </p>
              </div>

              {/* Conversation Stats */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-purple-700">Session Stats</p>
                    <p className="text-2xl font-bold text-purple-700">{messages.length}</p>
                    <p className="text-[9px] text-purple-600">Messages exchanged</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center text-2xl">
                    💬
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}