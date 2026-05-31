import { useState, useEffect, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router";
import Sidebar from "../../components/Sidebar";
import ZaraFloat from "../../components/ZaraFloat";

type Course = {
  id: string;
  title: string;
  category: string;
  progress: number;
  totalTopics: number;
  completedTopics: number;
  difficulty: string;
  accentColor: string;
  icon: string;
};

type Task = {
  id: string;
  taskTime: string;
  taskName: string;
  taskType: string;
  durationMinutes: number;
  isDone: boolean;
  taskDate: string;
};

type LeaderboardEntry = {
  id: string;
  name: string;
  credits: number;
  avatar: string;
  rank: number;
};

export default function LearningHub() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, setUser } = useOutletContext<any>();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [stats, setStats] = useState<any>({ streak: 0, consistency: 0, procredits: 0, rank: 0 });
  const [zaraTip, setZaraTip] = useState("Keep pushing forward!");
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastCompletedTask, setLastCompletedTask] = useState<string | null>(null);
  const rightSidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    var updateTime = () => {
      var now = new Date();
      setGreeting(now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening");
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateTime();
    var interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    var token = localStorage.getItem("token");
    var headers = { Authorization: "Bearer " + token };
    try {
      // Fetch courses
      var coursesRes = await fetch("http://localhost:5000/api/learning/courses", { headers });
      if (coursesRes.ok) {
        var coursesData = await coursesRes.json();
        setCourses(coursesData.courses || []);
      }
      
      // Fetch dashboard stats
      var statsRes = await fetch("http://localhost:5000/api/dashboard/stats", { headers });
      if (statsRes.ok) { 
        var s = await statsRes.json(); 
        setStats({
          streak: s.streak || 0,
          consistency: s.consistency || 0,
          procredits: s.procredits || 0,
          rank: s.rank || 0
        });
        if (setUser) setUser((prev: any) => ({ ...prev, procredits: s.procredits }));
      }
      
      // Fetch today's tasks
      var tasksRes = await fetch("http://localhost:5000/api/dashboard/tasks", { headers });
      if (tasksRes.ok) { 
        var t = await tasksRes.json(); 
        // Map tasks to match the UI format
        var mappedTasks = (t.tasks || []).map((task: any) => ({
          id: task.id,
          taskTime: task.taskTime || task.time,
          taskName: task.taskName || task.task,
          taskType: task.taskType || task.type,
          durationMinutes: task.durationMinutes || parseInt(task.duration) || 30,
          isDone: task.isDone || task.done || false,
          taskDate: task.taskDate
        }));
        setDailyTasks(mappedTasks); 
      }
      
      // Fetch leaderboard
      var lbRes = await fetch("http://localhost:5000/api/dashboard/leaderboard", { headers });
      if (lbRes.ok) { 
        var lb = await lbRes.json(); 
        setLeaderboardData(lb.entries || []); 
      }
      
      // Fetch Zara tip
      var tipRes = await fetch("http://localhost:5000/api/chatbot/zara/tip", { headers });
      if (tipRes.ok) { 
        var tip = await tipRes.json(); 
        setZaraTip(tip.tip); 
      }
    } catch (err) { 
      console.error(err);
      // Set fallback data if API fails
      setDailyTasks([
        { id: "1", taskTime: "09:00 AM", taskName: "Complete React Module", taskType: "Learning", durationMinutes: 45, isDone: false, taskDate: new Date().toISOString() },
        { id: "2", taskTime: "11:00 AM", taskName: "Weekly Assessment", taskType: "Assessment", durationMinutes: 30, isDone: true, taskDate: new Date().toISOString() },
        { id: "3", taskTime: "02:00 PM", taskName: "Build Portfolio Project", taskType: "Project", durationMinutes: 60, isDone: false, taskDate: new Date().toISOString() }
      ]);
      setStats({ streak: 25, consistency: 85, procredits: 2450, rank: 8 });
    }
    finally { setLoading(false); }
  };

  const toggleTaskCompletion = async (taskId: string, currentDone: boolean) => {
    if (updatingTask === taskId) return;
    
    setUpdatingTask(taskId);
    const token = localStorage.getItem("token");
    
    // Optimistic update
    setDailyTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, isDone: !currentDone } : task
    ));
    
    // If completing task, show celebration
    if (!currentDone) {
      const completedTask = dailyTasks.find(t => t.id === taskId);
      setLastCompletedTask(completedTask?.taskName || null);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
    
    try {
      await fetch(`http://localhost:5000/api/dashboard/tasks/${taskId}/toggle`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: "Bearer " + token 
        },
        body: JSON.stringify({ done: !currentDone })
      });
      
      // Refresh stats after task completion
      var statsRes = await fetch("http://localhost:5000/api/dashboard/stats", { 
        headers: { Authorization: "Bearer " + token } 
      });
      if (statsRes.ok) { 
        var s = await statsRes.json(); 
        setStats(s);
        if (setUser) setUser((prev: any) => ({ ...prev, procredits: s.procredits }));
      }
    } catch (err) {
      console.error("Failed to update task:", err);
      // Revert on error
      setDailyTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, isDone: currentDone } : task
      ));
    } finally {
      setUpdatingTask(null);
    }
  };

  const completedTasks = dailyTasks.filter(t => t.isDone).length;
  const dailyProgress = dailyTasks.length > 0 ? Math.round((completedTasks / dailyTasks.length) * 100) : 0;

  // Format duration minutes to readable string
  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    }
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="h-screen flex overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-bounce"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0.15s" }}></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0.3s" }}></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Syne:wght@600;700;800&display=swap');
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes celebrate {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100px) rotate(360deg); opacity: 0; }
        }
        
        @keyframes checkBounce {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        .task-enter {
          animation: slideIn 0.3s ease both;
        }
        
        .celebration {
          animation: celebrate 0.5s ease both;
        }
        
        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 8px;
          animation: confetti 1.5s ease-out forwards;
        }
        
        .checkbox-animation {
          animation: checkBounce 0.3s ease;
        }
        
        .progress-bar {
          transition: width 0.5s ease;
        }
        
        .task-card {
          transition: all 0.2s ease;
        }
        
        .task-card:hover {
          transform: translateX(4px);
          background: linear-gradient(90deg, #f0fdf4 0%, #ffffff 100%);
        }
        
        .task-completed {
          background: linear-gradient(90deg, #f0fdf4 0%, #f9fafb 100%);
        }
        
        /* Custom scrollbar for right sidebar */
        .right-sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f1f1;
        }
        
        .right-sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        
        .right-sidebar-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .right-sidebar-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        
        .right-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
      
      <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className="flex-1 overflow-y-auto">
        {/* Celebration Overlay */}
        {showCelebration && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="celebration bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-full shadow-2xl">
              🎉 Task Completed! +5 Credits 🎉
            </div>
          </div>
        )}
        
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-5 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Syne', sans-serif" }}>
                {greeting}, {user?.fullName?.split(" ")[0] || "Student"}! 👋
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • {currentTime}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                <span className="text-base">🔥</span>
                <span className="font-bold text-amber-600 text-sm">{stats?.streak || 0} day streak</span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                <span className="text-base">📊</span>
                <span className="font-bold text-emerald-600 text-sm">{stats?.consistency || 0}% score</span>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-4 py-2 shadow-sm">
                <span className="text-base">⭐</span>
                <span className="font-bold text-amber-600 text-sm">{stats?.procredits || user?.procredits || 0} credits</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Today's Schedule Section - From Database */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-700" style={{ fontFamily: "'Syne', sans-serif" }}>📋 Today's Schedule</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  {completedTasks}/{dailyTasks.length} Completed
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {dailyProgress}% done
                </span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Progress Bar */}
              <div className="h-1.5 bg-slate-100">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-r-full progress-bar" 
                  style={{ width: dailyProgress + '%' }}
                ></div>
              </div>
              
              {/* Task List */}
              <div className="divide-y divide-slate-50 max-h-[320px] overflow-y-auto">
                {dailyTasks.length === 0 ? (
                  <div className="p-8 text-center">
                    <span className="text-3xl mb-2 block">✅</span>
                    <p className="text-slate-500 text-sm">No tasks for today!</p>
                    <p className="text-slate-400 text-xs mt-1">Take a break or explore courses</p>
                  </div>
                ) : (
                  dailyTasks.map((task, idx) => {
                    const isCompleted = task.isDone;
                    const isUpdating = updatingTask === task.id;
                    
                    return (
                      <div 
                        key={task.id} 
                        className={`task-card flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${
                          isCompleted ? 'task-completed' : 'hover:bg-slate-50/50'
                        }`}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                        onClick={() => toggleTaskCompletion(task.id, isCompleted)}
                      >
                        {/* Premium Checkbox */}
                        <div className="relative flex-shrink-0">
                          <div 
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
                              isCompleted 
                                ? 'bg-emerald-500 border-emerald-500 shadow-sm' 
                                : 'border-slate-300 bg-white hover:border-emerald-400'
                            } ${isUpdating ? 'opacity-50' : ''}`}
                          >
                            {isCompleted && (
                              <svg 
                                className="w-3 h-3 text-white checkbox-animation" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor" 
                                strokeWidth={3}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          {isUpdating && (
                            <div className="absolute -top-1 -right-1 w-3 h-3">
                              <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                        
                        {/* Task Time */}
                        <span className={`text-[10px] font-mono w-14 flex-shrink-0 ${isCompleted ? 'text-slate-400' : 'text-slate-500'}`}>
                          {task.taskTime}
                        </span>
                        
                        {/* Task Name */}
                        <p className={`text-xs flex-1 font-medium transition-all ${
                          isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'
                        }`}>
                          {task.taskName}
                        </p>
                        
                        {/* Task Type Badge */}
                        <span className={`text-[9px] px-2 py-0.5 rounded-full flex-shrink-0 ${
                          task.taskType === 'Learning' ? 'bg-purple-100 text-purple-600' :
                          task.taskType === 'Assessment' ? 'bg-amber-100 text-amber-600' :
                          task.taskType === 'Project' ? 'bg-blue-100 text-blue-600' :
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                          {task.taskType}
                        </span>
                        
                        {/* Duration */}
                        <span className={`text-[10px] w-12 text-right flex-shrink-0 ${isCompleted ? 'text-slate-400' : 'text-slate-400'}`}>
                          {formatDuration(task.durationMinutes)}
                        </span>
                        
                        {/* Completed Badge */}
                        {isCompleted && (
                          <span className="text-[9px] font-medium text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                            Done
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* My Courses Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-700" style={{ fontFamily: "'Syne', sans-serif" }}>📚 My Courses</h2>
              <button onClick={() => navigate("/student/courses")} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition">
                View All →
              </button>
            </div>
            
            {courses.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-100 p-8 text-center shadow-sm">
                <span className="text-4xl mb-3 block">📚</span>
                <p className="text-slate-600 font-medium text-sm">No courses enrolled yet</p>
                <button onClick={() => navigate("/student/courses")} className="mt-3 px-5 py-2 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition">
                  Browse Courses
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.slice(0, 3).map((course, idx) => (
                  <div 
                    key={course.id} 
                    onClick={() => navigate("/student/courses/learn/" + course.id)} 
                    className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md cursor-pointer transition-all group"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-sm" style={{ background: (course.accentColor || "#10b981") + "15" }}>
                        {course.icon || "📚"}
                      </div>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                        course.difficulty === "Beginner" ? "bg-emerald-100 text-emerald-700" :
                        course.difficulty === "Intermediate" ? "bg-amber-100 text-amber-700" :
                        "bg-purple-100 text-purple-700"
                      }`}>
                        {course.difficulty || "Beginner"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm mb-1 line-clamp-1">{course.title}</h3>
                    <p className="text-[10px] text-slate-400 mb-2">{course.category} • {course.completedTopics}/{course.totalTopics} topics</p>
                    <div className="h-1.5 bg-slate-100 rounded-full mb-2 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500 progress-bar" style={{ width: (course.progress || 0) + '%', background: course.accentColor || "#10b981" }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold" style={{ color: course.accentColor || "#10b981" }}>{course.progress || 0}%</span>
                      <span className="text-[10px] text-slate-400 group-hover:text-emerald-500 transition">Continue →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Right Sidebar - Scrollable */}
      <aside 
        ref={rightSidebarRef}
        className="w-[280px] bg-white border-l border-slate-100 flex flex-col flex-shrink-0 overflow-y-auto right-sidebar-scroll"
      >
        <div className="p-4 space-y-4">
          {/* Zara AI Card */}
          <div 
            onClick={() => navigate("/student/chat")}
            className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all group border border-emerald-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm shadow-sm">✨</div>
              <div>
                <h4 className="font-semibold text-slate-700 text-sm">Zara AI</h4>
                <span className="text-[9px] text-emerald-600">Your Study Partner</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 italic mb-2">"{zaraTip}"</p>
            <button className="w-full bg-emerald-500 text-white text-[10px] font-semibold py-1.5 rounded-lg hover:bg-emerald-600 transition">
              Chat with Zara
            </button>
          </div>
          
          {/* Leaderboard */}
          <div className="border border-slate-100 rounded-xl p-4">
            <h4 className="font-bold text-slate-700 text-sm mb-3">🏆 Leaderboard</h4>
            <div className="space-y-2">
              {leaderboardData.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">No leaderboard data</p>
              ) : (
                leaderboardData.slice(0, 5).map((entry, i) => (
                  <div key={entry.id || i} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-sm ${
                      i === 0 ? "bg-amber-400 text-white" :
                      i === 1 ? "bg-slate-400 text-white" :
                      i === 2 ? "bg-amber-600 text-white" :
                      "bg-slate-100 text-slate-500"
                    }`}>
                      {entry.rank || i + 1}
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[9px] font-bold shadow-sm">
                      {entry.avatar || entry.name?.charAt(0) || "👤"}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium truncate">{entry.name}</p>
                      <p className="text-[9px] text-slate-400">{entry.credits} credits</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ProCredits Card */}
          <div 
            onClick={() => navigate("/student/wallet")}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all group border border-amber-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                  <span className="text-sm">⭐</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 text-sm">ProCredits</h4>
                  <span className="text-[9px] text-amber-600">Rewards Wallet</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-amber-700">{stats?.procredits || 0}</p>
                <p className="text-[8px] text-amber-500">total credits</p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-2">
              <button className="flex-1 bg-white/60 text-amber-700 text-[10px] font-semibold py-1.5 rounded-lg hover:bg-white transition-all">
                Earn
              </button>
              <button className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-semibold py-1.5 rounded-lg hover:shadow-md transition-all">
                Redeem
              </button>
            </div>
            
            <div className="mt-2 pt-2 border-t border-amber-200/50">
              <div className="flex items-center justify-between">
                <p className="text-[8px] text-amber-600">Next reward at 500 credits</p>
                <p className="text-[8px] text-amber-700 font-semibold flex items-center gap-1">
                  🎁 {Math.max(0, 500 - (stats?.procredits || 0))} to go
                </p>
              </div>
              <div className="mt-1 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all" style={{ width: `${Math.min(100, ((stats?.procredits || 0) / 500) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <ZaraFloat 
        user={user} 
        stats={{ 
          tasksLeft: dailyTasks.filter(t => !t.isDone).length, 
          nextTask: dailyTasks.find(t => !t.isDone)?.taskName || "Study", 
          dailyProgress: dailyProgress, 
          streak: stats?.streak || 0, 
          consistency: stats?.consistency || 0 
        }} 
      />
    </div>
  );
}