import { useState, useEffect } from "react";
import { useOutletContext } from "react-router";
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

export default function EmployerAnalytics() {
  const { user } = useOutletContext<any>();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplicants: 0,
    shortlisted: 0,
    hired: 0,
    viewCount: 0,
    avgMatchScore: 0
  });

  const [applicationData, setApplicationData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [12, 19, 25, 32, 38, 45, 42]
  });

  const [statusData, setStatusData] = useState({
    labels: ['Applied', 'Shortlisted', 'Interview', 'Hired', 'Rejected'],
    data: [45, 28, 15, 8, 12]
  });

  const [jobPerformance, setJobPerformance] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // Fetch employer stats
      const statsRes = await fetch("http://localhost:5000/api/employer/stats", { headers });
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats || {
          totalJobs: 12,
          totalApplicants: 156,
          shortlisted: 48,
          hired: 23,
          viewCount: 892,
          avgMatchScore: 76
        });
      }

      // Fetch application trend
      const trendRes = await fetch(`http://localhost:5000/api/employer/application-trend?range=${timeRange}`, { headers });
      if (trendRes.ok) {
        const data = await trendRes.json();
        setApplicationData({
          labels: data.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          data: data.values || [12, 19, 25, 32, 38, 45, 42]
        });
      }

      // Fetch job performance
      const jobsRes = await fetch("http://localhost:5000/api/employer/jobs/performance", { headers });
      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setJobPerformance(data.jobs || [
          { title: "Frontend Developer", applicants: 45, shortlisted: 12, hired: 3, matchScore: 82 },
          { title: "Backend Engineer", applicants: 38, shortlisted: 10, hired: 2, matchScore: 78 },
          { title: "Full Stack Developer", applicants: 52, shortlisted: 15, hired: 4, matchScore: 85 },
          { title: "Data Scientist", applicants: 29, shortlisted: 8, hired: 1, matchScore: 74 },
          { title: "DevOps Engineer", applicants: 21, shortlisted: 6, hired: 1, matchScore: 71 }
        ]);
      }

      // Fetch recent activity
      const activityRes = await fetch("http://localhost:5000/api/employer/recent-activity", { headers });
      if (activityRes.ok) {
        const data = await activityRes.json();
        setRecentActivity(data.activities || [
          { action: "New application received", job: "Frontend Developer", count: 3, time: "2 hours ago" },
          { action: "Candidate shortlisted", job: "Backend Engineer", candidate: "Arun Kumar", time: "5 hours ago" },
          { action: "Interview scheduled", job: "Full Stack Developer", candidate: "Divya Lakshmi", time: "Yesterday" },
          { action: "Candidate hired", job: "Data Scientist", candidate: "Karthikeyan", time: "2 days ago" },
          { action: "Job posted", job: "DevOps Engineer", time: "3 days ago" }
        ]);
      }

      // Fetch status distribution
      const statusRes = await fetch("http://localhost:5000/api/employer/application-status", { headers });
      if (statusRes.ok) {
        const data = await statusRes.json();
        setStatusData({
          labels: data.labels || ['Applied', 'Shortlisted', 'Interview', 'Hired', 'Rejected'],
          data: data.values || [45, 28, 15, 8, 12]
        });
      }

    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { title: "Total Jobs", value: stats.totalJobs, change: "+2", icon: "💼", color: "from-blue-500 to-cyan-500", bg: "bg-blue-50" },
    { title: "Total Applicants", value: stats.totalApplicants, change: "+18", icon: "👥", color: "from-indigo-500 to-purple-500", bg: "bg-indigo-50" },
    { title: "Shortlisted", value: stats.shortlisted, change: "+5", icon: "⭐", color: "from-amber-500 to-orange-500", bg: "bg-amber-50" },
    { title: "Hired", value: stats.hired, change: "+3", icon: "✅", color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50" },
    { title: "Profile Views", value: stats.viewCount, change: "+42", icon: "👁️", color: "from-rose-500 to-pink-500", bg: "bg-rose-50" },
    { title: "Avg Match Score", value: `${stats.avgMatchScore}%`, change: "+5%", icon: "🎯", color: "from-sky-500 to-blue-500", bg: "bg-sky-50" },
  ];

  const applicationChartData = {
    labels: applicationData.labels,
    datasets: [{
      label: 'Applications Received',
      data: applicationData.data,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      borderWidth: 2.5,
      pointBackgroundColor: '#8b5cf6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.4,
      fill: true,
    }],
  };

  const statusChartData = {
    labels: statusData.labels,
    datasets: [{
      data: statusData.data,
      backgroundColor: ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'],
      borderColor: 'white',
      borderWidth: 2,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { font: { size: 11, family: "'Inter', sans-serif" } } },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.8)' }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { font: { size: 11 } } }
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { font: { size: 10 } } },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .stat-card {
          animation: slideUp 0.3s ease both;
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px -12px rgba(0, 0, 0, 0.15);
        }
        
        .chart-card {
          transition: all 0.3s ease;
        }
        
        .chart-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px -12px rgba(0, 0, 0, 0.1);
        }
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>

      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-md">
              <span className="text-lg">📊</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Inter', sans-serif" }}>
                Recruitment Analytics
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">Track your hiring performance and metrics</p>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 justify-end mb-5">
          {[
            { id: "week", label: "This Week", icon: "📅" },
            { id: "month", label: "This Month", icon: "📆" },
            { id: "year", label: "This Year", icon: "📊" },
          ].map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeRange === range.id
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {statsCards.map((stat, idx) => (
            <div key={stat.title} className={`stat-card ${stat.bg} rounded-xl p-3 shadow-sm border border-slate-100`} style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="flex items-center justify-between mb-1">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-sm shadow-sm`}>
                  {stat.icon}
                </div>
                <span className="text-[9px] font-semibold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                  {stat.change}
                </span>
              </div>
              <p className="text-xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* Application Trend Chart */}
          <div className="chart-card bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-slate-700">📈 Application Trend</h3>
              <p className="text-[9px] text-slate-400">Applications received over time</p>
            </div>
            <div className="h-60">
              <Line data={applicationChartData} options={chartOptions} />
            </div>
          </div>

          {/* Application Status Distribution */}
          <div className="chart-card bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-slate-700">📊 Application Status</h3>
              <p className="text-[9px] text-slate-400">Current pipeline distribution</p>
            </div>
            <div className="h-60">
              <Doughnut data={statusChartData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* Job Performance Table */}
        <div className="chart-card bg-white rounded-xl p-4 shadow-sm border border-slate-100 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">📋 Job Performance</h3>
              <p className="text-[9px] text-slate-400">Performance metrics by job posting</p>
            </div>
            <button className="text-[9px] text-orange-600 font-medium">View All →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 rounded-lg">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500">Job Title</th>
                  <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-500">Applicants</th>
                  <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-500">Shortlisted</th>
                  <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-500">Hired</th>
                  <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-500">Match Score</th>
                  <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-500">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobPerformance.map((job, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-all">
                    <td className="px-3 py-2.5 text-xs font-medium text-slate-700">{job.title}</td>
                    <td className="px-3 py-2.5 text-center text-xs text-slate-600">{job.applicants}</td>
                    <td className="px-3 py-2.5 text-center text-xs text-amber-600 font-medium">{job.shortlisted}</td>
                    <td className="px-3 py-2.5 text-center text-xs text-emerald-600 font-medium">{job.hired}</td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs font-medium text-indigo-600">{job.matchScore}%</span>
                        <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${job.matchScore}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center text-xs font-medium text-emerald-600">
                      {Math.round((job.hired / job.applicants) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="chart-card bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">🕒 Recent Activity</h3>
              <p className="text-[9px] text-slate-400">Latest recruitment updates</p>
            </div>
            <button className="text-[9px] text-orange-600 font-medium">View All →</button>
          </div>
          <div className="space-y-2">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-all">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                  activity.action.includes('application') ? 'bg-blue-100 text-blue-600' :
                  activity.action.includes('shortlisted') ? 'bg-amber-100 text-amber-600' :
                  activity.action.includes('interview') ? 'bg-purple-100 text-purple-600' :
                  activity.action.includes('hired') ? 'bg-emerald-100 text-emerald-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {activity.action.includes('application') ? '📝' :
                   activity.action.includes('shortlisted') ? '⭐' :
                   activity.action.includes('interview') ? '🎯' :
                   activity.action.includes('hired') ? '✅' : '📌'}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-700">{activity.action}</p>
                  <p className="text-[9px] text-slate-400">
                    {activity.job && `${activity.job}`}
                    {activity.candidate && ` • ${activity.candidate}`}
                  </p>
                </div>
                <span className="text-[9px] text-slate-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[8px] text-slate-400 flex items-center justify-center gap-2">
            <span className="w-1 h-1 rounded-full bg-orange-400 animate-pulse"></span>
            Data updated in real-time
            <span className="w-1 h-1 rounded-full bg-orange-400 animate-pulse"></span>
            Last sync: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}