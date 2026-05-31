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
  const [selectedMetric, setSelectedMetric] = useState<"progress" | "tasks" | "score">("progress");
  
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
  const [taskData, setTaskData] = useState<number[]>([]);
  const [scoreData, setScoreData] = useState<number[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    
    try {
      const statsRes = await fetch("http://localhost:5000/api/analytics/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const data = await statsRes.json();
        const statsData = data.stats || data;
        setStats({
          streak: statsData.streak || 25,
          consistency: statsData.consistency || 85,
          procredits: statsData.procredits || 2450,
          skillsCount: statsData.skillsCount || 8,
          coursesCount: statsData.coursesCount || 4,
          applicationsCount: statsData.applicationsCount || 6,
        });
      }
      
      const skillsRes = await fetch("http://localhost:5000/api/analytics/skills", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (skillsRes.ok) {
        const data = await skillsRes.json();
        const skillsData = data.skills || (data.success ? data.skills : data);
        if (skillsData && skillsData.length > 0) {
          setSkills(skillsData);
        } else {
          setSkills([
            { name: "React.js", progress: 88, level: "Advanced" },
            { name: "JavaScript", progress: 82, level: "Advanced" },
            { name: "Python", progress: 92, level: "Advanced" },
            { name: "Node.js", progress: 75, level: "Intermediate" },
            { name: "MongoDB", progress: 68, level: "Intermediate" },
          ]);
        }
      }
      
      const activitiesRes = await fetch("http://localhost:5000/api/analytics/activities?limit=5", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (activitiesRes.ok) {
        const data = await activitiesRes.json();
        const activitiesData = data.activities || (data.success ? data.activities : data);
        if (activitiesData && activitiesData.length > 0) {
          setActivities(activitiesData);
        } else {
          setActivities([
            { activity: "Completed React Hooks Module", credits: "+50", date: new Date().toISOString(), type: "course" },
            { activity: "JavaScript Advanced Quiz", credits: "+30", date: new Date(Date.now() - 86400000).toISOString(), type: "quiz" },
            { activity: "Applied for Frontend Developer", credits: "+20", date: new Date(Date.now() - 172800000).toISOString(), type: "job" },
          ]);
        }
      }
      
      if (timeRange === "week") {
        setPerformanceLabels(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
        setPerformanceData([65, 68, 72, 70, 78, 82, 85]);
        setTaskData([3, 4, 2, 5, 4, 6, 5]);
        setScoreData([72, 75, 78, 74, 82, 85, 88]);
      } else if (timeRange === "month") {
        setPerformanceLabels(['W1', 'W2', 'W3', 'W4']);
        setPerformanceData([62, 68, 73, 85]);
        setTaskData([12, 15, 18, 24]);
        setScoreData([68, 72, 78, 86]);
      } else {
        setPerformanceLabels(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
        setPerformanceData([58, 62, 65, 63, 70, 75, 78, 76, 82, 85, 88, 92]);
        setTaskData([8, 10, 12, 11, 15, 18, 20, 19, 22, 25, 28, 32]);
        setScoreData([62, 65, 68, 67, 72, 76, 78, 77, 82, 85, 87, 90]);
      }
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentData = () => {
    switch(selectedMetric) {
      case "tasks": return taskData;
      case "score": return scoreData;
      default: return performanceData;
    }
  };

  const getCurrentLabel = () => {
    switch(selectedMetric) {
      case "tasks": return "Tasks Completed";
      case "score": return "Quiz Scores";
      default: return "Learning Progress";
    }
  };

  const getCurrentUnit = () => {
    switch(selectedMetric) {
      case "tasks": return "";
      case "score": return "%";
      default: return "%";
    }
  };

  const getCurrentColor = () => {
    switch(selectedMetric) {
      case "tasks": return "#f59e0b";
      case "score": return "#fb923c";
      default: return "#f97316";
    }
  };

  const currentData = getCurrentData();
  const avgValue = Math.round(currentData.reduce((a, b) => a + b, 0) / currentData.length);
  const improvement = currentData[currentData.length - 1] - currentData[0];

  const skillsChartData = {
    labels: skills.slice(0, 5).map(s => s.name),
    datasets: [{
      label: 'Proficiency (%)',
      data: skills.slice(0, 5).map(s => s.progress),
      backgroundColor: ['#f97316', '#fb923c', '#f59e0b', '#fdba74', '#fed7aa'],
      borderRadius: 8,
      barPercentage: 0.65,
    }],
  };

  const performanceChartData = {
    labels: performanceLabels,
    datasets: [{
      label: getCurrentLabel(),
      data: currentData,
      borderColor: getCurrentColor(),
      backgroundColor: `rgba(249, 115, 22, 0.08)`,
      borderWidth: 2.5,
      pointBackgroundColor: getCurrentColor(),
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.3,
      fill: true,
    }],
  };

  const activityCounts = {
    courses: activities.filter(a => a.type === 'course').length || 3,
    quizzes: activities.filter(a => a.type === 'quiz').length || 4,
    jobs: activities.filter(a => a.type === 'job').length || 2,
  };

  const activityData = {
    labels: ['Courses', 'Quizzes', 'Jobs'],
    datasets: [{
      data: [activityCounts.courses, activityCounts.quizzes, activityCounts.jobs],
      backgroundColor: ['#f97316', '#f59e0b', '#fdba74'],
      borderWidth: 0,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top' as const, 
        labels: { font: { size: 10, weight: '500' }, boxWidth: 10, usePointStyle: true } 
      },
      tooltip: { 
        backgroundColor: '#1e293b', 
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        bodyFont: { size: 11 },
        padding: 8,
        cornerRadius: 6,
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        max: selectedMetric === 'tasks' ? 35 : 100, 
        grid: { color: 'rgba(0,0,0,0.06)' }, 
        ticks: { 
          font: { size: 10, weight: '500' },
          callback: (v: any) => selectedMetric === 'tasks' ? v : v + '%'
        }
      },
      x: { 
        grid: { display: false }, 
        ticks: { font: { size: 10, weight: '500' } }
      }
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { font: { size: 10 } } },
      tooltip: { backgroundColor: '#1e293b', bodyFont: { size: 11 } }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        max: 100, 
        grid: { color: 'rgba(0,0,0,0.06)' }, 
        ticks: { font: { size: 10 }, callback: (v: any) => v + '%' }
      },
      x: { ticks: { font: { size: 10, weight: '500' } } }
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: { 
      legend: { position: 'bottom' as const, labels: { font: { size: 10 }, usePointStyle: true } },
      tooltip: { backgroundColor: '#1e293b', bodyFont: { size: 11 } }
    },
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100">
        <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-orange-700 text-xs font-medium">Loading analytics...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100">
      <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>📊 Analytics</h1>
              <p className="text-white/80 text-xs mt-0.5">Track your learning journey</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-full px-3 py-1.5">
              <span className="text-white text-xs font-medium">{user?.fullName?.split(" ")[0] || "Student"}</span>
            </div>
          </div>
        </div>

        <div className="p-5">
          {/* Stats Row - Compact with Better Contrast */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-5">
            <div className="bg-white rounded-xl p-3 shadow-sm border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <span className="text-xl">🔥</span>
                <span className="text-xl font-bold text-gray-800">{stats.streak}</span>
              </div>
              <p className="text-[10px] font-medium text-orange-600 mt-1">Day Streak</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <span className="text-xl">⭐</span>
                <span className="text-xl font-bold text-gray-800">{stats.skillsCount}</span>
              </div>
              <p className="text-[10px] font-medium text-amber-600 mt-1">Skills</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <span className="text-xl">📚</span>
                <span className="text-xl font-bold text-gray-800">{stats.coursesCount}</span>
              </div>
              <p className="text-[10px] font-medium text-yellow-600 mt-1">Courses</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <span className="text-xl">📈</span>
                <span className="text-xl font-bold text-gray-800">{stats.consistency}%</span>
              </div>
              <p className="text-[10px] font-medium text-green-600 mt-1">Avg Score</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <span className="text-xl">💰</span>
                <span className="text-xl font-bold text-gray-800">{stats.procredits}</span>
              </div>
              <p className="text-[10px] font-medium text-blue-600 mt-1">Credits</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <span className="text-xl">🏆</span>
                <span className="text-xl font-bold text-gray-800">{stats.applicationsCount}</span>
              </div>
              <p className="text-[10px] font-medium text-purple-600 mt-1">Applications</p>
            </div>
          </div>

          {/* Controls - Compact */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-1.5 bg-white rounded-lg p-1 shadow-sm">
              {[
                { id: "week", label: "Weekly" },
                { id: "month", label: "Monthly" },
                { id: "year", label: "Yearly" },
              ].map((range) => (
                <button
                  key={range.id}
                  onClick={() => setTimeRange(range.id as any)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    timeRange === range.id
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-gray-600 hover:bg-orange-50"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            
            <div className="flex gap-1.5 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setSelectedMetric("progress")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                  selectedMetric === "progress" ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-orange-50"
                }`}
              >
                <span>📈</span> Progress
              </button>
              <button
                onClick={() => setSelectedMetric("tasks")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                  selectedMetric === "tasks" ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-orange-50"
                }`}
              >
                <span>✅</span> Tasks
              </button>
              <button
                onClick={() => setSelectedMetric("score")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                  selectedMetric === "score" ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-orange-50"
                }`}
              >
                <span>🎯</span> Scores
              </button>
            </div>
          </div>

          {/* Main Chart Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Performance Chart */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{getCurrentLabel()}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-gray-800">
                      {currentData[currentData.length-1]}{getCurrentUnit()}
                    </span>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                      improvement >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {improvement >= 0 ? `+${improvement}` : improvement}{getCurrentUnit()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400">Average</p>
                  <p className="text-sm font-bold text-gray-700">{avgValue}{getCurrentUnit()}</p>
                </div>
              </div>
              <div className="h-48">
                <Line data={performanceChartData} options={chartOptions} />
              </div>
            </div>

            {/* Skills Chart */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🎯 Top Skills</p>
              <div className="h-48">
                <Bar data={skillsChartData} options={barOptions} />
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Activity Distribution */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">📊 Activity Breakdown</p>
              <div className="h-36">
                <Doughnut data={activityData} options={doughnutOptions} />
              </div>
              <div className="flex justify-center gap-4 mt-2">
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-800">{activityCounts.courses}</p>
                  <p className="text-[9px] text-orange-500">Courses</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-800">{activityCounts.quizzes}</p>
                  <p className="text-[9px] text-amber-500">Quizzes</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-800">{activityCounts.jobs}</p>
                  <p className="text-[9px] text-yellow-500">Jobs</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🕒 Recent Activity</p>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {activities.slice(0, 3).map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 transition-all">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                      activity.type === 'course' ? 'bg-orange-100 text-orange-600' :
                      activity.type === 'quiz' ? 'bg-amber-100 text-amber-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {activity.type === 'course' ? '📚' : activity.type === 'quiz' ? '📝' : '💼'}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-800 truncate">{activity.activity}</p>
                      <p className="text-[9px] text-gray-400">{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs font-bold text-green-600">{activity.credits}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Badges Row */}
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">🏆 Achievements</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { name: "7 Day Streak", icon: "🔥", earned: stats.streak >= 7 },
                { name: "Quiz Master", icon: "📝", earned: true },
                { name: "Course Hero", icon: "📚", earned: stats.coursesCount >= 1 },
                { name: "Skill Master", icon: "⭐", earned: stats.skillsCount >= 5 },
              ].map((badge, idx) => (
                <div key={idx} className={`text-center p-2 rounded-lg transition-all ${
                  badge.earned 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <div className="text-lg">{badge.icon}</div>
                  <p className="text-[8px] font-semibold mt-0.5">{badge.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}