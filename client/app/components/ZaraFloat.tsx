import { useState, useEffect } from "react";

const motivationalMessages = [
  "🔥 Keep going! You're on a {streak}-day streak!",
  "📚 {tasksLeft} tasks left today — you got this!",
  "⏰ Next task: {nextTask} at {nextTime}",
  "🎯 {progress}% of today's goals completed!",
  "💪 Consistency score: {consistency}% — top performer!",
  "🌟 Pro tip: Complete assessments to earn +50 credits!",
];

export default function ZaraFloat({ user, stats }: { user: any; stats: any }) {
  const [minimized, setMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const [show, setShow] = useState(true);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    // Rotate messages every 8 seconds
    const interval = setInterval(() => {
      setCurrentMsgIndex((prev) => (prev + 1) % motivationalMessages.length);
      setBounce(true);
      setTimeout(() => setBounce(false), 600);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Format message with real data
    const tasksLeft = stats?.tasksLeft || 2;
    const nextTask = stats?.nextTask || "DSA Practice";
    const nextTime = stats?.nextTime || "2:00 PM";
    const progress = stats?.dailyProgress || 60;
    const streak = stats?.streak || 7;
    const consistency = stats?.consistency || 90;

    const msg = motivationalMessages[currentMsgIndex]
      .replace("{streak}", streak)
      .replace("{tasksLeft}", tasksLeft)
      .replace("{nextTask}", nextTask)
      .replace("{nextTime}", nextTime)
      .replace("{progress}", progress)
      .replace("{consistency}", consistency);

    setMessage(msg);
  }, [currentMsgIndex, stats]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 transition-all duration-300">
      {/* Expanded Card */}
      {!minimized ? (
        <div className="bg-gradient-to-br from-[#0D1B40] via-[#1a2d5a] to-[#0D1B40] rounded-2xl p-5 w-80 shadow-2xl shadow-[#6c47ff]/20 border border-[#6c47ff]/20 animate-in"
          style={{ animation: "popIn 0.3s ease forwards" }}>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6c47ff] to-[#ec4899] flex items-center justify-center text-xl ai-glow shadow-lg">
                🤖
              </div>
              <div>
                <p className="text-white text-sm font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>Zara</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] text-emerald-400 font-medium">Your Study Partner</span>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setMinimized(true)} className="w-7 h-7 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white flex items-center justify-center text-sm transition-all">−</button>
              <button onClick={() => setShow(false)} className="w-7 h-7 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white flex items-center justify-center text-sm transition-all">✕</button>
            </div>
          </div>

          {/* Message */}
          <div className={`bg-white/5 rounded-xl p-4 border border-white/10 mb-3 transition-all ${bounce ? "scale-105" : "scale-100"}`}>
            <p className="text-sm text-white/90 leading-relaxed">{message}</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button className="px-3 py-2 bg-[#6c47ff]/20 text-white text-xs font-semibold rounded-xl hover:bg-[#6c47ff]/30 transition-all flex items-center gap-1.5 justify-center">
              <span>📋</span> View Tasks
            </button>
            <button className="px-3 py-2 bg-[#00C2CB]/20 text-white text-xs font-semibold rounded-xl hover:bg-[#00C2CB]/30 transition-all flex items-center gap-1.5 justify-center">
              <span>💬</span> Chat
            </button>
            <button className="px-3 py-2 bg-[#f59e0b]/20 text-white text-xs font-semibold rounded-xl hover:bg-[#f59e0b]/30 transition-all flex items-center gap-1.5 justify-center col-span-2">
              <span>⚡</span> Generate Today's Study Plan
            </button>
          </div>
        </div>
      ) : (
        /* Minimized Floating Icon */
        <button
          onClick={() => setMinimized(false)}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6c47ff] to-[#ec4899] flex items-center justify-center text-2xl ai-glow shadow-2xl shadow-purple-500/30 hover:scale-110 transition-all relative"
        >
          🤖
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}
    </div>
  );
}