import { useState, useEffect } from "react";

export default function CollegeBroadcast() {
  var [message, setMessage] = useState("");
  var [sending, setSending] = useState(false);
  var [success, setSuccess] = useState(false);
  var [broadcasts, setBroadcasts] = useState<any[]>([]);
  var [students, setStudents] = useState<any[]>([]);
  var [loading, setLoading] = useState(true);

  useEffect(function() { loadData(); }, []);

  var loadData = async function() {
    var token = localStorage.getItem("token");
    var headers = { Authorization: "Bearer " + token };
    try {
      // Load students
      var sRes = await fetch("http://localhost:5000/api/college/students", { headers });
      if (sRes.ok) {
        var sData = await sRes.json();
        setStudents(sData.students || []);
      }

      // Load broadcasts
      var bRes = await fetch("http://localhost:5000/api/broadcast/mine", { headers });
      if (bRes.ok) {
        var bData = await bRes.json();
        console.log("Broadcasts:", bData); // Debug
        setBroadcasts(bData.broadcasts || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  var sendBroadcast = async function() {
    if (!message.trim()) return;
    setSending(true);
    var token = localStorage.getItem("token");
    var res = await fetch("http://localhost:5000/api/broadcast/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ message: message.trim() })
    });
    if (res.ok) {
      var data = await res.json();
      setSuccess(true);
      setMessage("");
      setBroadcasts(function(prev) { return [data, ...prev]; });
      setTimeout(function() { setSuccess(false); }, 3000);
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-bounce"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-bounce" style={{animationDelay:"0.15s"}}></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-bounce" style={{animationDelay:"0.3s"}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto" style={{fontFamily:"'Inter',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes popIn { 0%{transform:scale(0.9);opacity:0} 100%{transform:scale(1);opacity:1} }
        .card { animation: fadeIn 0.3s ease both; }
        .success-pop { animation: popIn 0.3s ease; }
      `}</style>

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900" style={{fontFamily:"'Syne',sans-serif"}}>📢 Broadcast Message</h1>
        <p className="text-slate-500 text-sm mt-1">Send an announcement to all {students.length} students</p>
      </div>

      {success && (
        <div className="success-pop bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 mb-6 flex items-center gap-4">
          <span className="text-4xl">✅</span>
          <div>
            <p className="text-lg font-bold text-emerald-700">Broadcast Sent Successfully!</p>
            <p className="text-sm text-emerald-600">Message delivered to {students.length} students</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xl shadow-lg">📢</div>
          <div>
            <h3 className="font-bold text-slate-900">New Broadcast</h3>
            <p className="text-xs text-slate-500">This message will be sent to all {students.length} students</p>
          </div>
        </div>

        <textarea 
          value={message} 
          onChange={function(e: any){setMessage(e.target.value)}}
          placeholder="Type your broadcast message to all students..."
          rows={4}
          className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 transition-all resize-none text-slate-700" 
        />

        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-slate-400">{message.length} characters</p>
          <button 
            onClick={sendBroadcast} 
            disabled={sending || !message.trim()}
            className="px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-sm font-bold rounded-2xl hover:shadow-xl hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {sending ? "⏳ Sending..." : "📢 Send Broadcast"}
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-extrabold text-slate-900 mb-4" style={{fontFamily:"'Syne',sans-serif"}}>📋 Previous Broadcasts</h2>
        {broadcasts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <span className="text-5xl block mb-4">📢</span>
            <p className="text-slate-500 font-medium">No broadcasts sent yet</p>
            <p className="text-slate-400 text-sm mt-1">Your broadcast messages will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {broadcasts.map(function(msg: any, i: number) {
              // 🔒 SAFETY CHECK - handle undefined text
              var displayText = msg.text || msg.message || "No message content";
              return (
                <div key={msg.id || i} className="card bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all" style={{animationDelay:(i*0.05)+"s"}}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-lg shadow flex-shrink-0">📢</div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-800 leading-relaxed">
                        {displayText.startsWith("📢 ") ? displayText.replace("📢 ", "") : displayText}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-2">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) + " • " + new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}