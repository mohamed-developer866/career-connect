import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

interface ZaraFloatProps {
  user: any;
  stats: {
    tasksLeft: number;
    nextTask: string;
    dailyProgress: number;
    streak: number;
    consistency: number;
  };
}

export default function ZaraFloat({ user, stats }: ZaraFloatProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentTip, setCurrentTip] = useState("");
  const [tipIndex, setTipIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [showSparkles, setShowSparkles] = useState(false);

  const tips = [
    "✨ Complete your daily tasks to earn ProCredits!",
    "🎯 Your next goal: Complete " + stats?.nextTask || "your pending tasks",
    "📈 Keep your streak going! You're doing great!",
    "💡 Pro tip: Early morning study boosts retention by 30%",
    "🎓 Employers love candidates who show consistency!",
    "🔥 " + (stats?.streak || 0) + " day streak! Amazing work!",
    "⭐ You're in the top " + (100 - (stats?.consistency || 0)) + "% of learners!",
    "🚀 Complete assessments to showcase your skills!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsTyping(true);
    setDisplayedText("");
    const newTip = tips[tipIndex];
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i <= newTip.length) {
        setDisplayedText(newTip.substring(0, i));
        i++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 30);
    return () => clearInterval(typingInterval);
  }, [tipIndex]);

  const handleClick = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setIsOpen(true);
    } else if (isOpen) {
      setIsOpen(false);
      setTimeout(() => setIsMinimized(true), 300);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 1000);
    }
  };

  const handleChat = () => {
    navigate("/student/chat");
  };

  // Minimized state - BOTTOM RIGHT CORNER
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative group">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 animate-ping opacity-30"></div>
          <button
            onClick={handleClick}
            className="relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl hover:shadow-xl transition-all duration-300 flex items-center justify-center group-hover:scale-105"
          >
            <span className="text-2xl animate-bounce">✨</span>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white animate-pulse"></div>
          </button>
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
              Click to open Zara AI
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Open state - BOTTOM RIGHT CORNER
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`transform transition-all duration-300 ease-out ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}`}>
        <div className="relative">
          {/* Animated glow effect */}
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
          
          {/* Main Card */}
          <div className="relative w-80 bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-lg">
                    ✨
                  </div>
                  {showSparkles && (
                    <div className="absolute -top-1 -right-1">
                      <span className="text-yellow-300 text-xs animate-ping">⭐</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Zara AI Assistant
                  </h3>
                  <p className="text-white/70 text-[10px]">Your Career Guide</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 text-xs transition-all"
                >
                  −
                </button>
                <button
                  onClick={handleClick}
                  className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 text-xs transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              {/* Animated Tip */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-100">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm shadow-sm flex-shrink-0">
                    🤖
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-emerald-700 mb-1">Zara's Tip</p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {displayedText}
                      {isTyping && <span className="inline-block w-1.5 h-3 bg-emerald-500 ml-0.5 animate-pulse"></span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">Daily Progress</p>
                  <p className="text-sm font-bold text-emerald-600">{stats?.dailyProgress || 0}%</p>
                  <div className="mt-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all" style={{ width: `${stats?.dailyProgress || 0}%` }}></div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">Streak</p>
                  <p className="text-sm font-bold text-amber-600">🔥 {stats?.streak || 0} days</p>
                </div>
              </div>

              {/* Tasks Remaining */}
              {(stats?.tasksLeft > 0) && (
                <div className="bg-amber-50 rounded-lg p-2 border border-amber-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">📋</span>
                      <span className="text-[10px] font-medium text-amber-700">
                        {stats?.tasksLeft} task{stats?.tasksLeft !== 1 ? 's' : ''} remaining
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-amber-600">Next:</span>
                      <span className="text-[9px] font-medium text-amber-700 truncate max-w-[100px]">
                        {stats?.nextTask || "Study"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Motivation Quote */}
              <div className="text-center py-1">
                <p className="text-[9px] text-slate-400 italic">
                  {stats?.consistency >= 80 ? "🌟 You're on fire! Keep going!" :
                   stats?.consistency >= 60 ? "💪 Great progress! Stay consistent!" :
                   stats?.consistency >= 40 ? "📚 Every step counts! You've got this!" :
                   "✨ Start small, dream big! You can do it!"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleChat}
                  className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] font-semibold rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-1 group"
                >
                  <span className="group-hover:scale-110 transition-transform">💬</span>
                  Chat with Zara
                </button>
                <button
                  onClick={() => navigate("/student/analytics")}
                  className="flex-1 py-2 bg-white border border-emerald-200 text-emerald-600 text-[11px] font-semibold rounded-lg hover:bg-emerald-50 transition-all flex items-center justify-center gap-1"
                >
                  <span>📊</span>
                  Analytics
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-4 py-2">
              <p className="text-[8px] text-slate-400 text-center">
                AI-powered guidance • Career Connect
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Button (when closed) - BOTTOM RIGHT CORNER */}
      {!isOpen && !isMinimized && (
        <button
          onClick={handleClick}
          className="relative group"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 animate-ping opacity-40"></div>
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl hover:shadow-xl transition-all duration-300 flex items-center justify-center group-hover:scale-105">
            <span className="text-2xl">✨</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white animate-pulse"></div>
          </div>
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
              Ask Zara AI 🤖
            </div>
          </div>
        </button>
      )}
    </div>
  );
}