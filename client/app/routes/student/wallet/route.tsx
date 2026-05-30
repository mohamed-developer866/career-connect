import { useState } from "react";
import { useOutletContext } from "react-router";
import Sidebar from "../../../components/Sidebar";

const Icons = {
  coin: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v6l4 2"/>
    </svg>
  ),
  wallet: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
      <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/>
    </svg>
  ),
  gift: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"/>
      <rect x="2" y="7" width="20" height="5"/>
      <line x1="12" y1="22" x2="12" y2="7"/>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
    </svg>
  ),
  target: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  earn: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <polyline points="19 12 12 19 5 12"/>
    </svg>
  ),
  spend: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5"/>
      <polyline points="5 12 12 5 19 12"/>
    </svg>
  ),
  history: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  leaderboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C6 4 6 9 6 9z"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C18 4 18 9 18 9z"/>
      <path d="M4 22h16"/>
      <path d="M10 22V8h4v14"/>
    </svg>
  ),
  star: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  diamond: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  trophy: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M8 2h8v2c0 2.21-1.79 4-4 4s-4-1.79-4-4V2z"/>
    </svg>
  ),
  trendingUp: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 2 17"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
};

const transactions = [
  { id: 1, activity: "Completed JavaScript Assessment", credits: "+50", type: "earn", date: "May 9", time: "10:30 AM" },
  { id: 2, activity: "Daily Login Streak (7 days)", credits: "+35", type: "earn", date: "May 9", time: "9:00 AM" },
  { id: 3, activity: "Solved Color Picker Challenge", credits: "+30", type: "earn", date: "May 8", time: "4:15 PM" },
  { id: 4, activity: "Redeemed: Resume Template", credits: "-100", type: "spend", date: "May 8", time: "2:00 PM" },
  { id: 5, activity: "Got Shortlisted at TechCorp", credits: "+100", type: "earn", date: "May 7", time: "11:00 AM" },
  { id: 6, activity: "Completed Profile Setup", credits: "+50", type: "earn", date: "May 6", time: "3:30 PM" },
  { id: 7, activity: "Redeemed: Mock Interview", credits: "-200", type: "spend", date: "May 5", time: "1:00 PM" },
  { id: 8, activity: "Referral Bonus: Priya Sharma", credits: "+200", type: "earn", date: "May 4", time: "5:45 PM" },
];

const leaderboard = [
  { rank: 1, name: "Priya Sharma", credits: 1240, avatar: "PS", college: "IIT Madras", trend: "up" },
  { rank: 2, name: "Rahul Kumar", credits: 980, avatar: "RK", college: "NIT Trichy", trend: "up" },
  { rank: 3, name: "Ananya Patel", credits: 850, avatar: "AP", college: "BITS Pilani", trend: "down" },
  { rank: 4, name: "Vikram Singh", credits: 720, avatar: "VS", college: "VIT Vellore", trend: "up" },
  { rank: 5, name: "Sneha Reddy", credits: 680, avatar: "SR", college: "Anna University", trend: "same" },
  { rank: 6, name: "Arun Kumar", credits: 550, avatar: "AK", college: "PSG Tech", trend: "up" },
  { rank: 7, name: "Meera Joshi", credits: 480, avatar: "MJ", college: "MIT Chennai", trend: "down" },
  { rank: 8, name: "Karthik Raja", credits: 390, avatar: "KR", college: "SSN College", trend: "up" },
];

const earnActivities = [
  { icon: Icons.coin, title: "Complete Assessment", credits: "+50", progress: 80, color: "#8b5cf6", gradient: "from-purple-500 to-purple-400" },
  { icon: Icons.coin, title: "Get Shortlisted", credits: "+100", progress: 30, color: "#f59e0b", gradient: "from-amber-500 to-yellow-400" },
  { icon: Icons.coin, title: "Daily Login Streak", credits: "+5/day", progress: 70, color: "#ef4444", gradient: "from-red-500 to-rose-400" },
  { icon: Icons.coin, title: "Refer a Friend", credits: "+200", progress: 0, color: "#10b981", gradient: "from-emerald-500 to-green-400" },
  { icon: Icons.coin, title: "Complete Profile", credits: "+50", progress: 100, color: "#3b82f6", gradient: "from-blue-500 to-sky-400" },
  { icon: Icons.coin, title: "Win Hackathon", credits: "+500", progress: 0, color: "#ec4899", gradient: "from-pink-500 to-rose-400" },
];

export default function Wallet() {
  const { user } = useOutletContext<any>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"earn" | "history" | "leaderboard">("earn");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50/30" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100..900;1,100..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Space+Grotesk:wght@300..700&family=Syne:wght@400..800&display=swap');
        
        @keyframes floatCoin {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.5); }
        }
        
        .coin-anim { animation: floatCoin 3s ease-in-out infinite; }
        .fade-up { animation: fadeInUp 0.5s ease both; }
        .scale-in { animation: scaleIn 0.3s ease both; }
        .shimmer-card { background-size: 200% 100%; animation: shimmer 3s infinite; }
        .pulse-glow { animation: pulseGlow 2s infinite; }
        .gradient-text { background: linear-gradient(135deg, #8b5cf6, #6366f1); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .stat-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -12px rgba(139, 92, 246, 0.2); }
        .earn-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .earn-card:hover { transform: translateY(-6px); box-shadow: 0 25px 40px -12px rgba(0, 0, 0, 0.15); }
        .tab-active { background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; box-shadow: 0 8px 20px -6px rgba(139, 92, 246, 0.4); }
        .tab-inactive { background: white; color: #6b7280; border: 1px solid #e5e7eb; }
        .tab-inactive:hover { background: #faf5ff; border-color: #8b5cf6; color: #8b5cf6; transform: translateY(-2px); }
        .leaderboard-row { transition: all 0.3s ease; }
        .leaderboard-row:hover { background: linear-gradient(90deg, rgba(139, 92, 246, 0.05) 0%, transparent 100%); transform: translateX(4px); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.3); border-radius: 10px; }
      `}</style>
      
      <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-xl border-b border-purple-100/50 px-8 py-6 sticky top-0 z-10 shadow-sm fade-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-xl pulse-glow">
                  {Icons.diamond}
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-black gradient-text" style={{ fontFamily: "'Syne', sans-serif" }}>
                  ProCredits Wallet
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">Your premium rewards & earnings hub</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-purple-50 rounded-full px-4 py-2 flex items-center gap-2">
                <span className="text-yellow-500">{Icons.star}</span>
                <span className="text-sm font-semibold text-purple-700">Premium Member</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Hero Balance Section */}
          <div className="fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl shimmer-card">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
              <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-purple-400/20 rounded-full translate-y-1/2 blur-3xl"></div>
              
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center coin-anim">
                      {Icons.coin}
                    </div>
                    <div>
                      <p className="text-sm text-purple-200 font-medium uppercase tracking-wider">Total Balance</p>
                      <p className="text-6xl font-black tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        240
                      </p>
                      <p className="text-purple-200 text-sm mt-1">ProCredits</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2">
                      <span className="text-yellow-400">🏆</span>
                      <span className="text-sm font-semibold">Rank #12 in AMSCE</span>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-400/20 backdrop-blur rounded-full px-4 py-2">
                      {Icons.trendingUp}
                      <span className="text-sm font-semibold">+12 this week</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button className="px-8 py-3.5 bg-white text-purple-700 text-base font-bold rounded-2xl hover:shadow-2xl transition-all flex items-center gap-2 pulse-glow">
                    {Icons.earn} Earn Credits
                  </button>
                  <button className="px-8 py-3.5 bg-white/20 backdrop-blur text-white text-base font-bold rounded-2xl hover:bg-white/30 transition-all border border-white/20 flex items-center gap-2">
                    {Icons.gift} Redeem
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="stat-card bg-white rounded-2xl p-6 shadow-lg border border-purple-100 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white shadow-lg">
                  {Icons.earn}
                </div>
                <div>
                  <p className="text-3xl font-black text-emerald-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>+150</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Earned This Week</p>
                </div>
                <div className="ml-auto text-emerald-400 text-lg">📈</div>
              </div>
            </div>
            
            <div className="stat-card bg-white rounded-2xl p-6 shadow-lg border border-purple-100 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center text-white shadow-lg">
                  {Icons.spend}
                </div>
                <div>
                  <p className="text-3xl font-black text-rose-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>-300</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Spent This Week</p>
                </div>
                <div className="ml-auto text-rose-400 text-lg">📉</div>
              </div>
            </div>
            
            <div className="stat-card bg-white rounded-2xl p-6 shadow-lg border border-purple-100 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                  {Icons.target}
                </div>
                <div>
                  <p className="text-3xl font-black text-amber-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>260</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">To Next Reward</p>
                </div>
                <div className="ml-auto text-amber-400 text-lg">🎯</div>
              </div>
              <div className="mt-3 pt-3 border-t border-amber-100">
                <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: "48%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 flex-wrap fade-up" style={{ animationDelay: "0.2s" }}>
            {[
              { id: "earn" as const, label: "✨ Earn Credits", icon: Icons.earn },
              { id: "history" as const, label: "📜 Transaction History", icon: Icons.history },
              { id: "leaderboard" as const, label: "🏆 Leaderboard", icon: Icons.leaderboard },
            ].map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`px-7 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id ? "tab-active" : "tab-inactive"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Earn Credits Tab */}
          {activeTab === "earn" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-up" style={{ animationDelay: "0.25s" }}>
              {earnActivities.map((activity, index) => (
                <div 
                  key={index} 
                  className="earn-card bg-white rounded-2xl p-6 shadow-xl border border-slate-100 cursor-pointer"
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ animationDelay: `${0.25 + index * 0.05}s` }}
                >
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br ${activity.gradient} text-white transition-transform duration-300 ${hoveredCard === index ? "scale-110" : ""}`}>
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {activity.title}
                        </h3>
                        <p className="text-base font-bold" style={{ color: activity.color }}>{activity.credits}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Progress</span>
                        <span className="font-bold" style={{ color: activity.color }}>{activity.progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${activity.progress}%`, background: activity.color }}></div>
                      </div>
                    </div>
                    
                    {activity.progress === 100 && (
                      <div className="mt-4">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                          ✅ Completed - Claim Reward
                        </span>
                      </div>
                    )}
                    
                    <button className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-all border-2 border-slate-200 text-slate-600 hover:border-transparent hover:text-white hover:shadow-lg"
                      style={{ backgroundColor: hoveredCard === index ? activity.color : "transparent", borderColor: hoveredCard === index ? activity.color : "" }}
                    >
                      Start Activity →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Transaction History Tab */}
          {activeTab === "history" && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden fade-up" style={{ animationDelay: "0.25s" }}>
              <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-purple-700 uppercase tracking-wider">📋 Recent Transactions</p>
                  <p className="text-xs text-purple-500">Last 30 days</p>
                </div>
              </div>
              
              {transactions.map((txn, index) => (
                <div key={txn.id} className={`flex items-center gap-5 px-6 py-4 hover:bg-purple-50/30 transition-all group ${index < transactions.length - 1 ? "border-b border-slate-50" : ""}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 ${txn.type === "earn" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-500"}`}>
                    {txn.type === "earn" ? Icons.earn : Icons.spend}
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-slate-800">{txn.activity}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{txn.date} • {txn.time}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${txn.type === "earn" ? "text-emerald-600" : "text-rose-500"}`}>{txn.credits}</p>
                    <p className="text-[10px] text-slate-400">{txn.type === "earn" ? "credited" : "debited"}</p>
                  </div>
                </div>
              ))}
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
                <button className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition">
                  View All Transactions →
                </button>
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === "leaderboard" && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden fade-up" style={{ animationDelay: "0.25s" }}>
              <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {Icons.trophy}
                    <p className="text-sm font-bold text-amber-700 uppercase tracking-wider">🏆 Top Earners</p>
                  </div>
                  <p className="text-xs text-amber-600 font-medium">This Month</p>
                </div>
              </div>
              
              {leaderboard.map((entry, index) => (
                <div key={entry.rank} className={`leaderboard-row flex items-center gap-4 px-6 py-3.5 transition-all ${index < leaderboard.length - 1 ? "border-b border-slate-50" : ""}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shadow-md ${
                    index === 0 ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white" : 
                    index === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white" : 
                    index === 2 ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white" : 
                    "bg-slate-100 text-slate-500"
                  }`}>
                    {entry.rank}
                  </div>
                  
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {entry.avatar}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{entry.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{entry.college}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-black text-purple-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {entry.credits}
                    </p>
                    <p className="text-[9px] text-slate-400">credits</p>
                  </div>
                  
                  <div className="w-8 text-center">
                    <span className="text-lg">{entry.trend === "up" ? "📈" : entry.trend === "down" ? "📉" : "➖"}</span>
                  </div>
                </div>
              ))}
              
              <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-t border-slate-100 text-center">
                <button className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition flex items-center justify-center gap-2 mx-auto">
                  View Full Leaderboard 
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}