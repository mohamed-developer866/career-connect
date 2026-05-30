import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function CollegeRankings() {
  var navigate = useNavigate();
  var [rankings, setRankings] = useState<any[]>([]);
  var [loading, setLoading] = useState(true);
  var [selectedCollege, setSelectedCollege] = useState<any>(null);
  var [searchTerm, setSearchTerm] = useState("");

  useEffect(function() { loadRankings(); }, []);

  var loadRankings = async function() {
    var token = localStorage.getItem("token");
    var res = await fetch("http://localhost:5000/api/college/rankings/detailed", {
      headers: { Authorization: "Bearer " + token }
    });
    if (res.ok) {
      var data = await res.json();
      setRankings(data.rankings || []);
    }
    setLoading(false);
  };

  var filtered = searchTerm
    ? rankings.filter(function(r: any) { return (r.name||"").toLowerCase().includes(searchTerm.toLowerCase()); })
    : rankings;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-[#6c47ff] animate-bounce"></div><div className="w-3 h-3 rounded-full bg-[#6c47ff] animate-bounce" style={{animationDelay:"0.15s"}}></div><div className="w-3 h-3 rounded-full bg-[#6c47ff] animate-bounce" style={{animationDelay:"0.3s"}}></div></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto" style={{fontFamily:"'Inter',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes popIn { 0%{transform:scale(0.9);opacity:0} 100%{transform:scale(1);opacity:1} }
        .card { animation: fadeIn 0.3s ease both; }
        .modal-in { animation: popIn 0.2s ease; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900" style={{fontFamily:"'Syne',sans-serif"}}>🏆 College Rankings</h1>
          <p className="text-slate-500 text-sm mt-1">Based on student performance, skills & placement rate</p>
        </div>
        <div className="relative">
          <input type="text" placeholder="🔍 Search colleges..." value={searchTerm}
            onChange={function(e: any){setSearchTerm(e.target.value)}}
            className="w-64 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#6c47ff] transition-all" />
        </div>
      </div>

      {/* Top 3 Podium */}
      {rankings.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* 2nd Place */}
          <div className="card bg-white rounded-2xl border border-slate-200 p-6 text-center hover:shadow-xl transition-all" style={{animationDelay:"0.1s"}}>
            <span className="text-5xl block mb-3">🥈</span>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-bold text-lg shadow-lg mx-auto mb-3">{(rankings[1]?.name||"C").charAt(0)}</div>
            <h3 className="font-bold text-slate-900 text-lg">{rankings[1]?.name}</h3>
            <p className="text-sm text-slate-500">{rankings[1]?.totalStudents} students</p>
            <p className="text-2xl font-extrabold text-[#6c47ff] mt-2">{rankings[1]?.overallScore}</p>
            <p className="text-xs text-slate-400">Overall Score</p>
          </div>
          {/* 1st Place */}
          <div className="card bg-gradient-to-b from-yellow-50 to-white rounded-2xl border-2 border-yellow-300 p-6 text-center hover:shadow-2xl transition-all scale-105" style={{animationDelay:"0s"}}>
            <span className="text-6xl block mb-3">🥇</span>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-xl shadow-xl mx-auto mb-3">{(rankings[0]?.name||"C").charAt(0)}</div>
            <h3 className="font-extrabold text-slate-900 text-xl">{rankings[0]?.name}</h3>
            <p className="text-sm text-slate-500">{rankings[0]?.totalStudents} students</p>
            <p className="text-3xl font-extrabold text-[#6c47ff] mt-2">{rankings[0]?.overallScore}</p>
            <p className="text-xs text-slate-400">Overall Score</p>
          </div>
          {/* 3rd Place */}
          <div className="card bg-white rounded-2xl border border-slate-200 p-6 text-center hover:shadow-xl transition-all" style={{animationDelay:"0.2s"}}>
            <span className="text-5xl block mb-3">🥉</span>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white font-bold text-lg shadow-lg mx-auto mb-3">{(rankings[2]?.name||"C").charAt(0)}</div>
            <h3 className="font-bold text-slate-900 text-lg">{rankings[2]?.name}</h3>
            <p className="text-sm text-slate-500">{rankings[2]?.totalStudents} students</p>
            <p className="text-2xl font-extrabold text-[#6c47ff] mt-2">{rankings[2]?.overallScore}</p>
            <p className="text-xs text-slate-400">Overall Score</p>
          </div>
        </div>
      )}

      {/* Rankings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h2 className="font-bold text-slate-900">📊 Full Rankings</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Rank</th>
              <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">College</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">Students</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">Placed</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">Rate</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">Avg Credits</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">Score</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(function(college: any, i: number) {
              return (
                <tr key={college.id} className="hover:bg-slate-50 transition-all cursor-pointer"
                  onClick={function(){setSelectedCollege(college)}}>
                  <td className="px-6 py-4">
                    <span className={"w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold " + 
                      (college.rank === 1 ? "bg-yellow-100 text-yellow-700" : college.rank === 2 ? "bg-slate-100 text-slate-600" : college.rank === 3 ? "bg-amber-100 text-amber-700" : "bg-slate-50 text-slate-500")}>
                      #{college.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow">{college.name?.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{college.name}</p>
                        <p className="text-[10px] text-slate-400">{college.tpoName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-sm font-semibold text-slate-900">{college.totalStudents}</td>
                  <td className="px-4 py-4 text-center text-sm font-semibold text-emerald-600">{college.placedStudents}</td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{width: college.placementRate + "%"}}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-600">{college.placementRate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-sm font-bold text-[#6c47ff]">{college.avgCredits}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm font-extrabold text-[#6c47ff]">{college.overallScore}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button onClick={function(e: any){e.stopPropagation(); navigate("/employer/messages/" + college.id)}}
                      className="px-3 py-1.5 bg-[#6c47ff] text-white text-xs font-bold rounded-lg hover:bg-[#5a3de0] transition-all">
                      💬 Message
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedCollege && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={function(){setSelectedCollege(null)}}>
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl modal-in" onClick={function(e: any){e.stopPropagation()}}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">{selectedCollege.name?.charAt(0)}</div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900" style={{fontFamily:"'Syne',sans-serif"}}>{selectedCollege.name}</h2>
                  <p className="text-sm text-slate-500">Rank #{selectedCollege.rank}</p>
                </div>
              </div>
              <button onClick={function(){setSelectedCollege(null)}} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-extrabold text-emerald-700">{selectedCollege.overallScore}</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase">Overall Score</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-extrabold text-blue-700">{selectedCollege.placementRate}%</p>
                <p className="text-[10px] text-blue-500 font-bold uppercase">Placement Rate</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-extrabold text-purple-700">{selectedCollege.avgCredits}</p>
                <p className="text-[10px] text-purple-500 font-bold uppercase">Avg Credits</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-extrabold text-amber-700">{selectedCollege.avgSkills}</p>
                <p className="text-[10px] text-amber-500 font-bold uppercase">Avg Skills</p>
              </div>
            </div>

            <p className="text-sm font-bold text-slate-900 mb-2">🛠️ Top Skills</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCollege.topSkills?.map(function(skill: string) {
                return <span key={skill} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold border border-emerald-200">{skill}</span>;
              })}
            </div>

            <button onClick={function(){navigate("/employer/messages/" + selectedCollege.id)}}
              className="w-full py-3 bg-[#6c47ff] text-white font-bold rounded-2xl hover:bg-[#5a3de0] transition-all">
              💬 Message TPO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}