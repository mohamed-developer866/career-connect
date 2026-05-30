import { useState, useEffect } from "react";
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

export default function LearningHub() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useOutletContext<any>();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [stats, setStats] = useState<any>({ streak: 0, consistency: 0 });
  const [zaraTip, setZaraTip] = useState("Keep pushing forward!");
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

  useEffect(function() {
    var loadAllData = async function() {
      setLoading(true);
      var token = localStorage.getItem("token");
      var headers = { Authorization: "Bearer " + token };
      try {
        // Courses
        var coursesRes = await fetch("http://localhost:5000/api/learning/courses", { headers });
        if (coursesRes.ok) {
          var coursesData = await coursesRes.json();
          var list = coursesData.courses || [];
          setCourses(list);
        }
        // Stats
        var statsRes = await fetch("http://localhost:5000/api/dashboard/stats", { headers });
        if (statsRes.ok) { var s = await statsRes.json(); setStats(s); }
        // Tasks
        var tasksRes = await fetch("http://localhost:5000/api/dashboard/tasks", { headers });
        if (tasksRes.ok) { var t = await tasksRes.json(); setDailyTasks(t.tasks || []); }
        // Leaderboard
        var lbRes = await fetch("http://localhost:5000/api/dashboard/leaderboard", { headers });
        if (lbRes.ok) { var lb = await lbRes.json(); setLeaderboardData(lb.entries || []); }
        // Zara Tip
        var tipRes = await fetch("http://localhost:5000/api/chatbot/zara/tip", { headers });
        if (tipRes.ok) { var tip = await tipRes.json(); setZaraTip(tip.tip); }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadAllData();
  }, []);

  useEffect(function() {
    var updateTime = function() {
      var now = new Date();
      setGreeting(now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening");
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateTime();
    var interval = setInterval(updateTime, 60000);
    return function() { clearInterval(interval); };
  }, []);

  var completedTasks = dailyTasks.filter(function(t) { return t.done; }).length;
  var dailyProgress = dailyTasks.length > 0 ? Math.round((completedTasks / dailyTasks.length) * 100) : 0;

  if (loading) {
    return (
      <div className="h-screen flex overflow-hidden bg-[#F8FAFC]">
        <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={function() { setSidebarCollapsed(!sidebarCollapsed); }} />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#6c47ff] animate-bounce"></div>
            <div className="w-3 h-3 rounded-full bg-[#6c47ff] animate-bounce" style={{ animationDelay: "0.15s" }}></div>
            <div className="w-3 h-3 rounded-full bg-[#6c47ff] animate-bounce" style={{ animationDelay: "0.3s" }}></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[#F8FAFC]">
      <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={function() { setSidebarCollapsed(!sidebarCollapsed); }} />
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[28px] font-bold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{greeting}, {user?.fullName?.split(" ")[0] || "Student"}!</h1>
              <p className="text-sm text-slate-500 mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • {currentTime}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                <span>🔥</span><span className="font-bold text-amber-600">{stats?.streak || 0} day streak</span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                <span>📊</span><span className="font-bold text-emerald-600">{stats?.consistency || 0}% score</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">📋 Today's Schedule</h2>
              <span className="text-sm font-semibold text-[#6c47ff] bg-[#6c47ff]/5 px-3 py-1 rounded-full">{completedTasks}/{dailyTasks.length} Done</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="h-1.5 bg-slate-100">
                <div className="h-full bg-gradient-to-r from-[#6c47ff] to-[#a78bfa] transition-all rounded-r-full" style={{ width: dailyProgress + '%' }}></div>
              </div>
              <div className="divide-y divide-slate-50">
                {dailyTasks.slice(0, 5).map(function(task) {
                  return (
                    <div key={task.id} className={"flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 cursor-pointer " + (task.done ? "bg-slate-50/50" : "")}>
                      <div className={"w-5 h-5 rounded-md border-2 flex items-center justify-center " + (task.done ? "bg-[#6c47ff] border-[#6c47ff]" : "border-slate-300")}>
                        {task.done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className="text-xs font-mono text-slate-400 w-16">{task.time}</span>
                      <p className={"text-sm flex-1 font-medium " + (task.done ? "text-slate-400 line-through" : "text-slate-700")}>{task.task}</p>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full">{task.type}</span>
                      <span className="text-xs text-slate-400 w-10 text-right">{task.duration}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">📚 My Courses</h2>
              <button onClick={function() { navigate("/student/courses"); }} className="text-sm font-semibold text-[#6c47ff] hover:underline">View All →</button>
            </div>
            {courses.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
                <span className="text-5xl mb-4 block">📚</span>
                <p className="text-slate-600 font-medium">No courses enrolled yet</p>
                <button onClick={function() { navigate("/student/courses"); }} className="mt-4 px-6 py-2.5 bg-[#6c47ff] text-white text-sm font-bold rounded-xl hover:bg-[#5a3de0]">Browse Courses</button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {courses.map(function(course) {
                  return (
                    <div key={course.id} onClick={function() { navigate("/student/courses/learn/" + course.id); }} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg cursor-pointer group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: (course.accentColor || "#6c47ff") + "20" }}>{course.icon || "📚"}</div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{course.difficulty || "Beginner"}</span>
                      </div>
                      <h3 className="font-semibold text-slate-900 text-sm mb-1">{course.title}</h3>
                      <p className="text-[11px] text-slate-400 mb-3">{course.category} • {course.completedTopics}/{course.totalTopics} topics</p>
                      <div className="h-1.5 bg-slate-100 rounded-full mb-3 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: (course.progress || 0) + '%', background: course.accentColor || "#6c47ff" }}></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold" style={{ color: course.accentColor || "#6c47ff" }}>{course.progress || 0}%</span>
                        <span className="text-xs text-slate-400 group-hover:text-[#6c47ff]">Continue →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <aside className="w-[300px] bg-white border-l border-slate-200 flex flex-col flex-shrink-0 overflow-y-auto">
        <div className="p-5 space-y-5">
          <div className="bg-gradient-to-br from-[#F0FBFF] to-white border border-[#6c47ff]/20 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-lg">✨</div>
              <div><h4 className="font-semibold text-slate-900">Zara AI</h4><span className="text-[10px] text-emerald-600">Your Study Partner</span></div>
            </div>
            <p className="text-sm text-slate-600 italic mb-3">"{zaraTip}"</p>
            <button onClick={function() { navigate("/student/chat"); }} className="w-full bg-[#6c47ff] text-white text-xs font-semibold py-2 rounded-xl">Chat with Zara</button>
          </div>
          <div className="border border-slate-200 rounded-2xl p-5">
            <h4 className="font-bold text-slate-900 mb-3">🏆 Leaderboard</h4>
            <div className="space-y-1.5">
              {leaderboardData.slice(0, 5).map(function(entry, i) {
                return (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50">
                    <div className={"w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold " + (i===0?"bg-yellow-400 text-white":i===1?"bg-slate-300 text-white":i===2?"bg-amber-500 text-white":"bg-slate-100 text-slate-500")}>{i+1}</div>
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6c47ff] to-[#a78bfa] flex items-center justify-center text-white text-[10px] font-bold">{entry.avatar || "👤"}</div>
                    <div className="flex-1"><p className="text-sm font-medium truncate">{entry.name}</p><p className="text-[10px] text-slate-400">{entry.credits} credits</p></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      <ZaraFloat user={user} stats={{ tasksLeft: dailyTasks.filter(function(t) { return !t.done; }).length, nextTask: dailyTasks.find(function(t) { return !t.done; })?.task || "Study", dailyProgress: dailyProgress, streak: stats?.streak || 0, consistency: stats?.consistency || 0 }} />
    </div>
  );
} 