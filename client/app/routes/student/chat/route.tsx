import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router";
import { askAI } from "../../../lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const suggestedQuestions = [
  { text: "How can I improve my resume?", icon: "📄" },
  { text: "Which jobs match my skills?", icon: "🎯" },
  { text: "How to prepare for technical interviews?", icon: "💻" },
  { text: "What skills should I learn next?", icon: "📈" },
  { text: "Review my career roadmap", icon: "🗺️" },
];

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

export default function AIChat() {
  const { user } = useOutletContext<any>();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: `Hello ${user?.fullName?.split(" ")[0] || "there"}! 👋 I'm your AI Career Guide. I can help with resumes, job matching, interview prep, and career planning. What would you like to discuss?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
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
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Sorry, I'm having trouble connecting. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-0px)] bg-[#F0F4FF]">
      {/* ===== LEFT PANEL – Navy background 30% ===== */}
      <div className="w-[30%] bg-[#0D1B40] flex flex-col p-5 flex-shrink-0">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#00C2CB] flex items-center justify-center text-white text-lg">
            🤖
          </div>
          <h2 className="text-white text-lg font-bold">AI Career Guide</h2>
        </div>

        {/* Student Profile Mini-Card */}
        <div className="bg-white/10 border border-white/10 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#00C2CB] flex items-center justify-center text-white font-bold text-xs">
              {user?.avatarInitials || "BG"}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{user?.fullName || "Student"}</p>
              <p className="text-[#8899BB] text-xs">B.Tech AI & DS</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#00C2CB]/20 border border-[#00C2CB]/30 rounded-lg px-3 py-1.5">
            <span className="text-sm">🪙</span>
            <span className="text-[#00C2CB] text-xs font-bold">{user?.procredits || 240} Credits</span>
          </div>
        </div>

        {/* Skills Tags */}
        <div className="mb-5">
          <p className="text-[#8899BB] text-[10px] font-semibold uppercase tracking-wider mb-2">Your Skills</p>
          <div className="flex flex-wrap gap-2">
            {["React", "TypeScript", "Node.js", "Python"].map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 border border-[#00C2CB]/30 rounded-full text-[#00C2CB] text-[10px] font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Suggested Questions */}
        <div className="flex-1">
          <p className="text-[#8899BB] text-[10px] font-semibold uppercase tracking-wider mb-3">
            Suggested Questions
          </p>
          <div className="space-y-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q.text}
                onClick={() => sendMessage(q.text)}
                disabled={loading}
                className="w-full flex items-center justify-between px-3 py-2.5 border border-white/10 rounded-lg text-white text-sm hover:bg-white/10 transition-all text-left disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <span>{q.icon}</span>
                  {q.text}
                </span>
                <span className="text-[#8899BB]">→</span>
              </button>
            ))}
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={() =>
            setMessages([
              {
                id: "welcome",
                role: "ai",
                content: `Hello ${user?.fullName?.split(" ")[0] || "there"}! 👋 What would you like to discuss today?`,
              },
            ])
          }
          className="w-full py-2 border border-[#00C2CB] text-[#00C2CB] text-sm font-semibold rounded-lg hover:bg-[#00C2CB]/10 transition-all mt-4"
        >
          + New Chat
        </button>
      </div>

      {/* ===== RIGHT PANEL – Chat Area 70% ===== */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D0DDF0]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm font-semibold text-[#0D1B40]">Career Connect AI</span>
            <span className="text-xs text-[#8899BB]">Online</span>
          </div>
          <button
            onClick={() =>
              setMessages([
                {
                  id: "welcome",
                  role: "ai",
                  content: `Hello ${user?.fullName?.split(" ")[0] || "there"}! 👋 What would you like to discuss today?`,
                },
              ])
            }
            className="text-xs text-[#8899BB] hover:text-[#0D1B40] transition-colors"
          >
            Clear Chat
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {/* AI Avatar */}
              {msg.role === "ai" && (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00C2CB] to-[#008B93] flex items-center justify-center text-white text-sm flex-shrink-0 mr-3 mt-1 shadow-md">
                  🤖
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[80%] px-6 py-4 rounded-2xl text-[15px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#00C2CB] text-white rounded-br-md shadow-md"
                    : "bg-white text-[#0D1B40] rounded-bl-md border border-[#E0E8F5] shadow-sm"
                }`}
              >
                {msg.role === "user" ? (
                  <div className="whitespace-pre-line">{msg.content}</div>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-xl font-bold text-[#0D1B40] mb-3 mt-2 pb-2 border-b border-[#D0DDF0]">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg font-bold text-[#00C2CB] mb-3 mt-4">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base font-semibold text-[#0D1B40] mb-2 mt-3">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="mb-3 text-[15px] leading-7 text-[#1A2B4C]">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-none space-y-2 mb-3">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-5 space-y-2 mb-3 marker:text-[#00C2CB] marker:font-semibold">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="flex items-start gap-2 text-[15px] text-[#1A2B4C] leading-7">
                          <span className="text-[#00C2CB] mt-1.5 flex-shrink-0">•</span>
                          <span>{children}</span>
                        </li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-[#0D1B40]">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic text-[#8899BB]">{children}</em>
                      ),
                      code: ({ children, className }) => {
                        const isInline = !className;
                        return isInline ? (
                          <code className="bg-[#F0F4FF] text-[#00C2CB] px-2 py-0.5 rounded-md text-sm font-medium border border-[#C0D8F0]">
                            {children}
                          </code>
                        ) : (
                          <code className="block bg-[#0D1B40] text-[#00C2CB] p-4 rounded-xl text-sm overflow-x-auto my-3 border border-[#1E3264] font-mono">
                            {children}
                          </code>
                        );
                      },
                      hr: () => <hr className="border-[#D0DDF0] my-4" />,
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          className="text-[#00C2CB] underline decoration-dotted underline-offset-2 hover:text-[#008B93] transition-colors"
                          target="_blank"
                          rel="noopener"
                        >
                          {children}
                        </a>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-[#00C2CB] pl-4 italic text-[#8899BB] my-3 bg-[#F0F4FF] py-2 pr-3 rounded-r-lg">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>

              {/* User Avatar */}
              {msg.role === "user" && (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0D1B40] to-[#1E3264] flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ml-3 mt-1 shadow-md">
                  {user?.avatarInitials || "BG"}
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00C2CB] to-[#008B93] flex items-center justify-center text-white text-sm flex-shrink-0 mr-3 shadow-md">
                🤖
              </div>
              <div className="bg-white border border-[#D0DDF0] rounded-2xl rounded-bl-md px-6 py-4 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00C2CB] animate-bounce" style={{ animationDelay: "0s" }}></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00C2CB] animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00C2CB] animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="px-6 py-4 border-t border-[#D0DDF0] bg-white">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Ask your career question..."
              disabled={loading}
              className="flex-1 px-5 py-3.5 border border-[#C0D8F0] rounded-xl text-[15px] outline-none focus:border-[#00C2CB] focus:ring-2 focus:ring-[#00C2CB]/10 disabled:bg-gray-50 transition-all"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="w-12 h-12 bg-[#00C2CB] text-white rounded-xl flex items-center justify-center hover:bg-[#008B93] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-[11px] text-[#8899BB] mt-2 text-center">
            Career Connect AI uses DeepSeek to provide career guidance. Responses may not always be 100% accurate.
          </p>
        </div>
      </div>
    </div>
  );
}