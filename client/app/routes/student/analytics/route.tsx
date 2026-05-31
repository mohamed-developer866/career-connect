import { useState, useEffect } from "react";
import { useOutletContext } from "react-router";
import Sidebar from "../../../components/Sidebar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics() {
  const { user } = useOutletContext<any>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    streak: 0,
    consistency: 0,
    procredits: 0,
    skillsCount: 0,
    coursesCount: 0,
    applicationsCount: 0,
  });
  
  const [skills, setSkills] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [performanceLabels, setPerformanceLabels] = useState<string[]>([]);
  const [performanceData, setPerformanceData] = useState<number[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      const statsRes = await fetch("http://localhost:5000/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats({
          streak: data.streak || 25,
          consistency: data.consistency || 85,
          procredits: data.procredits || 2450,
          skillsCount: data.skillsCount || 10,
          coursesCount: data.coursesCount || 3,
          applicationsCount: data.applicationsCount || 5,
        });
      }
      
      const skillsRes = await fetch("http://localhost:5000/api/analytics/skills", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (skillsRes.ok) {
        const data = await skillsRes.json();
        setSkills(data.skills || []);
      } else {
        setSkills([
          { name: "React.js", progress: 88, level: "Advanced", color: "#f97316" },
          { name: "JavaScript", progress: 82, level: "Advanced", color: "#fb923c" },
          { name: "Python", progress: 92, level: "Advanced", color: "#f59e0b" },
        ]);
      }
      
      const activitiesRes = await fetch("http://localhost:5000/api/analytics/activities", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (activitiesRes.ok) {
        const data = await activitiesRes.json();
        setActivities(data.activities || []);
      }
      
      const perfRes = await fetch(`http://localhost:5000/api/analytics/performance?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (perfRes.ok) {
        const data = await perfRes.json();
        setPerformanceLabels(data.labels || []);
        setPerformanceData(data.data || []);
      }
      
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const skillsChartData = {
    labels: skills.map(s => s.name),
    datasets: [{
      label: 'Proficiency Score (%)',
      data: skills.map(s => s.progress),
      backgroundColor: ['#f97316', '#fb923c', '#f59e0b', '#fdba74', '#fed7aa', '#ffedd5'],
      borderRadius: 8,
      barPercentage: 0.7,
    }],
  };

  const performanceChartData = {
    labels: performanceLabels,
    datasets: [{
      label: 'Learning Progress',
      data: performanceData,
      borderColor: '#f97316',
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
      borderWidth: 2.5,
      pointBackgroundColor: '#f59e0b',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.4,
      fill: true,
    }],
  };

  const activityData = {
    labels: ['Courses', 'Assessments', 'Practice', 'Applications'],
    datasets: [{
      data: [
        activities.filter(a => a.type === 'course').length || 3,
        activities.filter(a => a.type === 'quiz').length || 5,
        activities.filter(a => a.type === 'practice').length || 8,
        activities.filter(a => a.type === 'job').length || 2,
      ],
      backgroundColor: ['#f97316', '#fb923c', '#f59e0b', '#fdba74'],
      borderColor: 'white',
      borderWidth: 2,
    }],
  };

  const statsCards = [
    { title: "Learning Streak", value: `${stats.streak} days`, icon: "🔥", color: "#f97316", bg: "#fff7ed" },
    { title: "Skills Mastered", value: stats.skillsCount.toString(), icon: "⭐", color: "#f59e0b", bg: "#fffbeb" },
    { title: "Courses Enrolled", value: stats.coursesCount.toString(), icon: "📚", color: "#f97316", bg: "#fff7ed" },
    { title: "Avg Score", value: `${stats.consistency}%`, icon: "📈", color: "#f59e0b", bg: "#fffbeb" },
    { title: "ProCredits", value: stats.procredits.toLocaleString(), icon: "💰", color: "#f97316", bg: "#fff7ed" },
    { title: "Applications", value: stats.applicationsCount.toString(), icon: "🏆", color: "#f59e0b", bg: "#fffbeb" },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { font: { size: 11, family: "'Inter', sans-serif" } } },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.8)' }
    },
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { callback: (v: any) => v + '%' } },
      x: { grid: { display: false } }
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const, labels: { font: { size: 10 } } } },
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100">
        <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-orange-700 text-sm">Loading analytics...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Syne:wght@400;500;600;700;800&display=swap');
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .stat-card {
          animation: slideUp 0.4s ease both;
          transition: all 0.3s ease;
        }
        .stat-card:hover { transform: translateY(-3px); }
        .chart-card { transition: all 0.3s ease; }
        .chart-card:hover { transform: translateY(-2px); box-shadow: 0 15px 35px -12px rgba(249,115,22,0.15); }
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #fed7aa; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #f97316; border-radius: 10px; }
      `}</style>

      <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="flex-1 overflow-y-auto">
        {/* Curved Header Banner - Orange Theme */}
        <div className="relative bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 pb-12 rounded-b-3xl shadow-lg">
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 rounded-t-3xl"></div>
          <div className="px-6 pt-5 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                  📊 Analytics Dashboard
                </h1>
                <p className="text-white/80 text-xs mt-0.5">Track your learning journey</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                <span className="text-white text-xs font-medium">👋 {user?.fullName?.split(" ")[0] || "Student"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 -mt-4">
          {/* Stats Cards - Orange Theme */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-5">
            {statsCards.map((stat, idx) => (
              <div
                key={stat.title}
                className="stat-card bg-white rounded-xl p-2.5 shadow-sm border border-orange-100"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-sm shadow-sm mb-1.5`}>
                  {stat.icon}
                </div>
                <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                <p className="text-[8px] text-orange-600">{stat.title}</p>
              </div>
            ))}
          </div>

          {/* Time Range Toggle - Orange Theme */}
          <div className="flex gap-1.5 justify-end mb-4">
            {[
              { id: "week", label: "Week", icon: "📅" },
              { id: "month", label: "Month", icon: "📆" },
              { id: "year", label: "Year", icon: "📊" },
            ].map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  timeRange === range.id
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-white text-orange-600 hover:bg-orange-50 border border-orange-200"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Performance Chart */}
            <div className="chart-card bg-white rounded-xl p-3 shadow-sm border border-orange-100">
              <div className="mb-2">
                <h3 className="text-sm font-semibold text-orange-800">📈 Learning Progress</h3>
                <p className="text-[9px] text-orange-500">Daily performance trend</p>
              </div>
              <div className="h-52">
                {performanceData.length > 0 ? (
                  <Line data={performanceChartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-orange-400 text-xs">Complete tasks to see progress</p>
                  </div>
                )}
              </div>
            </div>

            {/* Skills Chart */}
            <div className="chart-card bg-white rounded-xl p-3 shadow-sm border border-orange-100">
              <div className="mb-2">
                <h3 className="text-sm font-semibold text-orange-800">🎯 Skills Proficiency</h3>
                <p className="text-[9px] text-orange-500">Your skill mastery levels</p>
              </div>
              <div className="h-52">
                {skills.length > 0 ? (
                  <Bar data={skillsChartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-orange-400 text-xs">No skills data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Activity Chart */}
            <div className="chart-card bg-white rounded-xl p-3 shadow-sm border border-orange-100">
              <div className="mb-2">
                <h3 className="text-sm font-semibold text-orange-800">📊 Activity Breakdown</h3>
                <p className="text-[9px] text-orange-500">Learning distribution</p>
              </div>
              <div className="h-44">
                <Doughnut data={activityData} options={doughnutOptions} />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-3 shadow-sm border border-orange-100 lg:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-orange-800">🕒 Recent Activity</h3>
                  <p className="text-[9px] text-orange-500">Latest achievements</p>
                </div>
              </div>
              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {activities.length > 0 ? (
                  activities.slice(0, 4).map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-orange-50 transition-all">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${
                        activity.type === 'course' ? 'bg-orange-100 text-orange-600' :
                        activity.type === 'quiz' ? 'bg-amber-100 text-amber-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {activity.type === 'course' ? '📚' : activity.type === 'quiz' ? '📝' : '💻'}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700">{activity.activity}</p>
                        <p className="text-[8px] text-orange-400">{new Date(activity.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-orange-600">{activity.credits}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-orange-400 text-xs">No recent activities</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Achievements - Orange Theme */}
          <div className="bg-white rounded-xl p-3 shadow-sm border border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-orange-800">🏆 Achievements</h3>
                <p className="text-[9px] text-orange-500">Badges earned</p>
              </div>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {[
                { name: "7 Day", icon: "🔥", color: "from-orange-500 to-red-500", earned: stats.streak >= 7 },
                { name: "Quiz", icon: "📝", color: "from-orange-400 to-amber-500", earned: true },
                { name: "Course", icon: "📚", color: "from-amber-500 to-yellow-500", earned: stats.coursesCount >= 1 },
                { name: "Credits", icon: "💰", color: "from-orange-500 to-amber-500", earned: stats.procredits >= 1000 },
                { name: "Top", icon: "🏆", color: "from-yellow-500 to-orange-500", earned: false },
                { name: "Master", icon: "⭐", color: "from-orange-400 to-amber-400", earned: false },
              ].map((badge, idx) => (
                <div key={idx} className={`text-center p-1.5 rounded-lg ${badge.earned ? 'bg-gradient-to-br ' + badge.color + ' text-white shadow-sm' : 'bg-orange-50 text-orange-300'}`}>
                  <div className="text-base">{badge.icon}</div>
                  <p className="text-[7px] font-medium">{badge.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}