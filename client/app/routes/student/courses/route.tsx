import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router";
import Sidebar from "../../../components/Sidebar";

export default function CourseLibrary() {
  const { user } = useOutletContext<any>();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Extra showcase courses with rich content
  const showcaseCourses = [
    {
      id: "showcase_1",
      title: "Generative AI Masterclass",
      subtitle: "Generative / Prompts / LLMs / Usecases",
      category: "AI/ML",
      difficulty: "Beginner",
      duration: "15 Hours",
      progress: 0,
      icon: "🤖",
      bgGradient: "from-purple-600 to-pink-600",
      cardGradient: "from-purple-50 to-pink-50",
      borderColor: "border-purple-200",
      students: "2.5k",
      isShowcase: true
    },
    {
      id: "showcase_2",
      title: "Modern Responsive Web Design",
      subtitle: "Flexbox / CSS / Media / Tailwind",
      category: "Frontend",
      difficulty: "Intermediate",
      duration: "36 Hours",
      progress: 0,
      icon: "🎨",
      bgGradient: "from-blue-600 to-cyan-600",
      cardGradient: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      students: "1.8k",
      isShowcase: true
    },
    {
      id: "showcase_3",
      title: "Programming Fundamentals",
      subtitle: "Python / Basics / Functions",
      category: "Programming",
      difficulty: "Beginner",
      duration: "65 Hours",
      progress: 0,
      icon: "🐍",
      bgGradient: "from-green-600 to-emerald-600",
      cardGradient: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      students: "3.2k",
      isShowcase: true
    },
    {
      id: "showcase_4",
      title: "Full Stack Development",
      subtitle: "React / Node.js / MongoDB / Express",
      category: "Full Stack",
      difficulty: "Advanced",
      duration: "80 Hours",
      progress: 0,
      icon: "🌐",
      bgGradient: "from-orange-600 to-red-600",
      cardGradient: "from-orange-50 to-red-50",
      borderColor: "border-orange-200",
      students: "4.1k",
      isShowcase: true
    },
    {
      id: "showcase_5",
      title: "Data Structures & Algorithms",
      subtitle: "Arrays / Linked Lists / Trees / DP",
      category: "DSA",
      difficulty: "Intermediate",
      duration: "120 Hours",
      progress: 0,
      icon: "📊",
      bgGradient: "from-indigo-600 to-purple-600",
      cardGradient: "from-indigo-50 to-purple-50",
      borderColor: "border-indigo-200",
      students: "5.3k",
      isShowcase: true
    },
    {
      id: "showcase_6",
      title: "Cloud Computing (AWS)",
      subtitle: "EC2 / S3 / Lambda / Serverless",
      category: "DevOps",
      difficulty: "Advanced",
      duration: "50 Hours",
      progress: 0,
      icon: "☁️",
      bgGradient: "from-yellow-600 to-orange-600",
      cardGradient: "from-yellow-50 to-orange-50",
      borderColor: "border-yellow-200",
      students: "1.2k",
      isShowcase: true
    },
    {
      id: "showcase_7",
      title: "TypeScript Mastery",
      subtitle: "Types / Interfaces / Generics / React",
      category: "Frontend",
      difficulty: "Intermediate",
      duration: "25 Hours",
      progress: 0,
      icon: "📘",
      bgGradient: "from-sky-600 to-blue-600",
      cardGradient: "from-sky-50 to-blue-50",
      borderColor: "border-sky-200",
      students: "980",
      isShowcase: true
    },
    {
      id: "showcase_8",
      title: "Machine Learning Basics",
      subtitle: "Regression / Classification / Clustering",
      category: "AI/ML",
      difficulty: "Intermediate",
      duration: "60 Hours",
      progress: 0,
      icon: "🧠",
      bgGradient: "from-rose-600 to-pink-600",
      cardGradient: "from-rose-50 to-pink-50",
      borderColor: "border-rose-200",
      students: "2.1k",
      isShowcase: true
    },
    {
      id: "showcase_9",
      title: "DevOps with Docker & K8s",
      subtitle: "Containers / Orchestration / CI-CD",
      category: "DevOps",
      difficulty: "Advanced",
      duration: "40 Hours",
      progress: 0,
      icon: "🐳",
      bgGradient: "from-teal-600 to-cyan-600",
      cardGradient: "from-teal-50 to-cyan-50",
      borderColor: "border-teal-200",
      students: "750",
      isShowcase: true
    }
  ];

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/learning/courses/all", {
        headers: { Authorization: "Bearer " + token }
      });
      
      let coursesFromDB = [];
      if (res.ok) {
        const data = await res.json();
        coursesFromDB = data.courses || [];
      }
      
      const dbCoursesWithProgress = coursesFromDB.map((course, index) => ({
        ...course,
        progress: Math.floor(Math.random() * 100),
        students: `${Math.floor(Math.random() * 5000) + 500}`,
        bgGradient: `from-${['purple','pink','blue','green','orange','indigo'][index % 6]}-600 to-${['pink','purple','cyan','emerald','red','purple'][index % 6]}-600`,
        cardGradient: `from-${['purple','pink','blue','green','orange','indigo'][index % 6]}-50 to-${['pink','purple','cyan','emerald','red','purple'][index % 6]}-50`,
        borderColor: `border-${['purple','pink','blue','green','orange','indigo'][index % 6]}-200`,
        isShowcase: false
      }));
      
      const allCourses = [...dbCoursesWithProgress, ...showcaseCourses];
      setDbCourses(allCourses);
      
    } catch (err) {
      console.error("Fetch error:", err);
      setDbCourses(showcaseCourses);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "all", name: "All", icon: "✨" },
    { id: "Frontend", name: "Frontend", icon: "🎨" },
    { id: "Backend", name: "Backend", icon: "⚙️" },
    { id: "AI/ML", name: "AI/ML", icon: "🤖" },
    { id: "Programming", name: "Programming", icon: "💻" },
    { id: "Full Stack", name: "Full Stack", icon: "🌐" },
    { id: "DSA", name: "DSA", icon: "📊" },
    { id: "DevOps", name: "DevOps", icon: "🚀" },
  ];

  const filteredCourses = dbCourses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const continuingCourses = filteredCourses.filter(c => c.progress > 0 && c.progress < 100);
  const recommendedCourses = filteredCourses.filter(c => c.progress === 0).slice(0, 3);

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-purple-100 to-pink-100">
        <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-700 text-sm mt-3 font-medium">Loading courses...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        .course-card {
          transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          height: 100%;
          display: flex;
          flex-direction: column;
          border-radius: 24px;
        }
        
        .course-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.2);
        }
        
        .progress-bar {
          transition: width 0.5s ease;
        }
        
        .curved-header {
          border-radius: 20px 20px 30px 30px;
        }
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #8b5cf6, #ec4899); border-radius: 10px; }
      `}</style>

      <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-white/20 px-6 py-5 sticky top-0 z-10 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">✨ 2026 READY CURRICULUM ✨</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Course Library
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">Learn skills that actually get you a job</p>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-9 pr-4 py-2 rounded-full bg-white/80 backdrop-blur border border-purple-200 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Continue Learning Section */}
          {continuingCourses.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm shadow-md">
                  📖
                </div>
                <h2 className="text-lg font-bold text-slate-800">Continue Learning</h2>
              </div>
              <div className="space-y-4">
                {continuingCourses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => navigate("/student/courses/learn/" + course.id)}
                    className={`course-card bg-gradient-to-br ${course.cardGradient || 'from-purple-50 to-pink-50'} border ${course.borderColor || 'border-purple-200'} p-4 cursor-pointer shadow-md`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${course.bgGradient || 'from-purple-600 to-pink-600'} flex items-center justify-center text-white text-2xl shadow-lg`}>
                        {course.icon || "📚"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 text-base">{course.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{course.subtitle || course.description || "Course"}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] font-semibold text-slate-600 bg-white/60 px-2 py-0.5 rounded-full">{course.difficulty || "Beginner"}</span>
                          <span className="text-[10px] text-slate-500">{course.duration || "20h"}</span>
                          <span className="text-[10px] text-emerald-600">👥 {course.students || "1k"} students</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-base font-bold text-purple-600">{course.progress}%</span>
                          <span className="text-[10px] text-slate-400">completed</span>
                        </div>
                        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 progress-bar" style={{ width: `${course.progress}%` }}></div>
                        </div>
                        <button className="mt-2 text-xs font-semibold text-purple-600 hover:text-purple-700 transition flex items-center gap-1">
                          Continue Learning <span>→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recommended Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white text-sm shadow-md">
                  ⭐
                </div>
                <h2 className="text-lg font-bold text-slate-800">Recommended for you</h2>
              </div>
              <button className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition">View All →</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendedCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => navigate("/student/courses/learn/" + course.id)}
                  className={`course-card bg-gradient-to-br ${course.cardGradient || 'from-purple-50 to-pink-50'} border ${course.borderColor || 'border-purple-200'} p-4 cursor-pointer shadow-md`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${course.bgGradient || 'from-purple-600 to-pink-600'} flex items-center justify-center text-white text-2xl shadow-lg mb-3`}>
                    {course.icon || "📚"}
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">{course.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.subtitle || course.description || "Course"}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] font-semibold text-slate-600 bg-white/60 px-2 py-0.5 rounded-full">{course.difficulty || "Beginner"}</span>
                    <span className="text-[10px] text-slate-500">{course.duration || "20h"}</span>
                  </div>
                  <button className="mt-3 text-xs font-semibold text-purple-600 hover:text-purple-700 transition flex items-center gap-1">
                    Enroll Now <span>→</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* All Courses Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm shadow-md">
                📚
              </div>
              <h2 className="text-lg font-bold text-slate-800">All Courses</h2>
              <span className="text-xs text-slate-500 bg-white/60 backdrop-blur px-2 py-0.5 rounded-full">{filteredCourses.length} courses</span>
            </div>
            
            {filteredCourses.length === 0 ? (
              <div className="text-center py-16 bg-white/50 backdrop-blur rounded-2xl border border-white/30">
                <span className="text-5xl block mb-3">🔍</span>
                <p className="text-slate-600 text-sm">No courses found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => navigate("/student/courses/learn/" + course.id)}
                    className={`course-card bg-gradient-to-br ${course.cardGradient || 'from-purple-50 to-pink-50'} border ${course.borderColor || 'border-purple-200'} p-4 cursor-pointer shadow-md`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${course.bgGradient || 'from-purple-600 to-pink-600'} flex items-center justify-center text-white text-xl shadow-lg flex-shrink-0`}>
                        {course.icon || "📚"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{course.title}</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{course.subtitle || course.description || "Course"}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-[9px] font-semibold text-slate-600 bg-white/60 px-1.5 py-0.5 rounded-full">{course.difficulty || "Beginner"}</span>
                          <span className="text-[9px] text-slate-500">{course.duration || "20h"}</span>
                          <span className="text-[9px] text-emerald-600">👥 {course.students || "1k"}</span>
                        </div>
                      </div>
                    </div>
                    
                    {course.progress > 0 && (
                      <div className="mt-3 pt-2">
                        <div className="flex items-center justify-between text-[9px] mb-1">
                          <span className="text-slate-500">Progress</span>
                          <span className="font-semibold text-purple-600">{course.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 progress-bar" style={{ width: `${course.progress}%` }}></div>
                        </div>
                      </div>
                    )}
                    
                    <button className={`mt-3 text-xs font-semibold transition flex items-center gap-1 ${course.progress > 0 ? 'text-purple-600' : 'text-purple-600'}`}>
                      {course.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                      <span className="text-xs transition-transform group-hover:translate-x-0.5">→</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Footer */}
          <div className="text-center pt-4 pb-2">
            <p className="text-[10px] text-slate-500 flex items-center justify-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
              New courses added weekly
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
              {dbCourses.length}+ courses available
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}