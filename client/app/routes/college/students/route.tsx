import { useState, useEffect } from "react";

export default function CollegeStudents() {
  var [students, setStudents] = useState<any[]>([]);
  var [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  var [stats, setStats] = useState({ totalStudents: 0, totalPlaced: 0, totalActive: 0, avgCredits: 0 });
  var [search, setSearch] = useState("");
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState<string | null>(null);
  var [selectedStudent, setSelectedStudent] = useState<any>(null);
  var [departmentFilter, setDepartmentFilter] = useState("all");
  var [departments, setDepartments] = useState<string[]>([]);
  var [currentPage, setCurrentPage] = useState(1);
  var itemsPerPage = 10;

  useEffect(function() { loadStudents(); }, []);

  useEffect(function() {
    var filtered = students.filter(function(s) {
      var matchesSearch = s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
             s.email?.toLowerCase().includes(search.toLowerCase()) ||
             s.department?.toLowerCase().includes(search.toLowerCase());
      var matchesDept = departmentFilter === "all" || s.department === departmentFilter;
      return matchesSearch && matchesDept;
    });
    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [search, departmentFilter, students]);

  var loadStudents = async function() {
    setLoading(true);
    setError(null);
    var token = localStorage.getItem("token");
    var headers = { Authorization: "Bearer " + token };
    
    try {
      // Using the working endpoint from first component
      var res = await fetch("http://localhost:5000/api/college/public-test", { headers });
      
      if (res.ok) {
        var data = await res.json();
        console.log("✅ Data loaded:", data);
        
        var studentsList = data.students || [];
        setStudents(studentsList);
        setFilteredStudents(studentsList);
        setStats(data.stats || { totalStudents: 0, totalPlaced: 0, totalActive: 0, avgCredits: 0 });
        
        // Extract departments
        var uniqueDepts = Array.from(new Set(studentsList.map(function(s: any) { return s.department; }).filter(Boolean))) as string[];
        setDepartments(uniqueDepts);
      } else {
        setError("Failed to load students. Please try again.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to load students. Please make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  var totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  var paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 animate-spin" style={{animationDuration: '2s'}}></div>
            <div className="absolute inset-1 rounded-2xl bg-white flex items-center justify-center">
              <span className="text-3xl">🎓</span>
            </div>
          </div>
          <p className="text-violet-600 text-lg font-bold animate-pulse">Loading Students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Students</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={loadStudents} className="px-6 py-2 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl">👨‍🎓</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>
              <p className="text-gray-500 text-sm">View and manage all students in your college</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Students</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalStudents}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">👥</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Placed Students</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalPlaced}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">💼</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Learners</p>
                <p className="text-3xl font-bold text-amber-600">{stats.totalActive}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl">📚</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Avg Credits</p>
                <p className="text-3xl font-bold text-purple-600">{stats.avgCredits}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl">⭐</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 Search by name, email, or department..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition"
              />
            </div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 outline-none"
            >
              <option value="all">🏛️ All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <button
              onClick={loadStudents}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Credits</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Skills</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Courses</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedStudents.map(function(student, index) {
                  var placedCount = (student.jobApplications || []).filter(function(a: any) { return a.status === 'HIRED'; }).length;
                  var appliedCount = (student.jobApplications || []).length;
                  var skillCount = (student.skills || []).length;
                  var courseCount = (student.courseEnrollments || []).length;
                  
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedStudent(student)}>
                      <td className="px-6 py-4 text-sm text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                            {student.fullName?.charAt(0) || "S"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{student.fullName || "Unknown"}</p>
                            <p className="text-xs text-gray-500">{student.email}</p>
                          </div>
                        </div>
                       </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-violet-50 text-violet-700 rounded-lg text-xs font-medium">
                          {student.department || "Not Set"}
                        </span>
                       </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-amber-600">{student.procredits || 0}</span>
                       </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-gray-700">{skillCount}</span>
                          {skillCount > 0 && (
                            <div className="flex -space-x-1">
                              {(student.skills || []).slice(0, 2).map((s: any) => (
                                <div key={s.id} className="w-5 h-5 rounded-full bg-green-100 border border-white flex items-center justify-center text-[8px]">🔧</div>
                              ))}
                            </div>
                          )}
                        </div>
                       </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{courseCount}</span>
                       </td>
                      <td className="px-6 py-4">
                        {placedCount > 0 ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">✅ Placed</span>
                        ) : appliedCount > 0 ? (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">📝 Applying</span>
                        ) : (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">🎓 Active</span>
                        )}
                       </td>
                      <td className="px-6 py-4">
                        <button className="text-violet-600 hover:text-violet-800 text-sm font-medium">
                          View →
                        </button>
                       </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition"
              >
                Next
              </button>
            </div>
          )}

          {/* Empty State */}
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👨‍🎓</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">No Students Found</h3>
              <p className="text-gray-500 text-sm">No students match your search criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedStudent(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedStudent.fullName?.charAt(0) || "S"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedStudent.fullName}</h2>
                    <p className="text-gray-500 text-sm">{selectedStudent.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-violet-50 text-violet-700 rounded-full">{selectedStudent.department || "No Dept"}</span>
                      {selectedStudent.college && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{selectedStudent.college}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500">✕</button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-blue-700">{selectedStudent.procredits || 0}</p>
                  <p className="text-xs text-gray-500">Credits</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-green-700">{(selectedStudent.skills || []).length}</p>
                  <p className="text-xs text-gray-500">Skills</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-amber-700">{(selectedStudent.courseEnrollments || []).length}</p>
                  <p className="text-xs text-gray-500">Courses</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-purple-700">{(selectedStudent.jobApplications || []).length}</p>
                  <p className="text-xs text-gray-500">Applications</p>
                </div>
              </div>

              {/* Skills */}
              {(selectedStudent.skills || []).length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">🛠️ Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedStudent.skills || []).map((skill: any) => (
                      <div key={skill.id} className="px-3 py-1.5 bg-gray-100 rounded-lg">
                        <span className="text-gray-700">{skill.name}</span>
                        <span className="ml-1 text-xs text-gray-500">({skill.score}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Courses */}
              {(selectedStudent.courseEnrollments || []).length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">📚 Courses</h3>
                  <div className="space-y-2">
                    {(selectedStudent.courseEnrollments || []).map((enrollment: any) => (
                      <div key={enrollment.courseId} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-800">{enrollment.course?.title || "Course"}</span>
                          <span className="text-sm text-gray-500">{enrollment.progress || 0}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{width: `${enrollment.progress || 0}%`}}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Applications */}
              {(selectedStudent.jobApplications || []).length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">💼 Applications</h3>
                  <div className="space-y-2">
                    {(selectedStudent.jobApplications || []).map((app: any) => (
                      <div key={app.id} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">{app.job?.title || "Job"}</p>
                          <p className="text-sm text-gray-500">{app.job?.company}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          app.status === 'HIRED' ? 'bg-green-100 text-green-700' :
                          app.status === 'INTERVIEW' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}