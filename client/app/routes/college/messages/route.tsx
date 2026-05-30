import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { io } from "socket.io-client";

export default function CollegeMessages() {
  var navigate = useNavigate();
  var params = useParams();
  var userId = params["*"] || null;
  var [conversations, setConversations] = useState<any[]>([]);
  var [messages, setMessages] = useState<any[]>([]);
  var [newMessage, setNewMessage] = useState("");
  var [selectedUser, setSelectedUser] = useState<any>(null);
  var [loading, setLoading] = useState(true);
  var [activeToggle, setActiveToggle] = useState("all");
  var [searchTerm, setSearchTerm] = useState("");
  var [employers, setEmployers] = useState<any[]>([]);
  var [students, setStudents] = useState<any[]>([]);
  var [showNewChat, setShowNewChat] = useState(false);
  var [newChatType, setNewChatType] = useState("EMPLOYER");
  var [newChatSearch, setNewChatSearch] = useState("");
  var messagesEndRef = useRef<any>(null);
  var currentUserId = (function() { try { return JSON.parse(localStorage.getItem("user") || "{}").id; } catch(e) { return null; } })();
  

  useEffect(function() { loadConversations(); loadContacts(); }, []);
  useEffect(function() { 
  if (userId) { 
    setMessages([]); 
    loadMessages(userId); 
  } 
}, [userId]);

// NEW: Load user info when no conversation exists
useEffect(function() {
  if (userId && !selectedUser?.name) {
    var token = localStorage.getItem("token");
    var headers = { Authorization: "Bearer " + token };
    // Try to find student
    fetch("http://localhost:5000/api/messages/users?role=STUDENT", { headers })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var found = (data.users || []).find(function(u: any) { return u.id === userId; });
        if (found) {
          setSelectedUser({ id: found.id, name: found.fullName, role: "STUDENT", company: found.department || "Student" });
        }
      });
  }
}, [userId]);
  useEffect(function() { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(function() {
    var userStr = localStorage.getItem("user");
    if (!userStr) return;
    var user = JSON.parse(userStr);
    var socket = io("http://localhost:5000");
    socket.emit('join', user.id);
    socket.on('newMessage', function(msg: any) {
      if (userId && (msg.senderId === userId || msg.receiverId === userId)) {
        setMessages(function(prev: any) { return [...prev, msg]; });
      }
      loadConversations();
    });
    return function() { socket.disconnect(); };
  }, [userId]);

  var loadConversations = async function() {
    var token = localStorage.getItem("token");
    var res = await fetch("http://localhost:5000/api/messages/conversations", { headers: { Authorization: "Bearer " + token } });
    if (res.ok) { var data = await res.json(); setConversations(data.conversations || []); }
    setLoading(false);
  };

  var loadContacts = async function() {
    var token = localStorage.getItem("token");
    var headers = { Authorization: "Bearer " + token };
    var [eRes, sRes] = await Promise.all([
      fetch("http://localhost:5000/api/messages/users?role=EMPLOYER", { headers }),
      fetch("http://localhost:5000/api/messages/users?role=STUDENT", { headers })
    ]);
    if (eRes.ok) { var eData = await eRes.json(); setEmployers(eData.users || []); }
    if (sRes.ok) { var sData = await sRes.json(); setStudents(sData.users || []); }
  };

  var loadMessages = async function(otherId: string) {
    var token = localStorage.getItem("token");
    var res = await fetch("http://localhost:5000/api/messages/conversations/" + otherId, { headers: { Authorization: "Bearer " + token } });
    if (res.ok) {
      var data = await res.json(); setMessages(data.messages || []);
      var user = conversations.find(function(c: any) { return c.id === otherId; });
      setSelectedUser(user || { id: otherId, name: "User" });
    }
  };

  var sendMessage = async function() {
    if (!newMessage.trim() || !userId) return;
    var token = localStorage.getItem("token");
    await fetch("http://localhost:5000/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ receiverId: userId, text: newMessage })
    });
    setNewMessage(""); loadMessages(userId); loadConversations();
  };

  var startConversation = function(id: string) { navigate("/college/messages/" + id); };

  var startNewChat = function(id: string, name: string, role: string, company: string) {
    setSelectedUser({ id, name, role, company });
    navigate("/college/messages/" + id);
    setShowNewChat(false);
  };

  var filteredConversations = searchTerm
    ? conversations.filter(function(c: any) { return (c.name||"").toLowerCase().includes(searchTerm.toLowerCase()) || (c.company||"").toLowerCase().includes(searchTerm.toLowerCase()) || (c.role||"").toLowerCase().includes(searchTerm.toLowerCase()); })
    : activeToggle === "all" ? conversations
    : activeToggle === "employers" ? conversations.filter(function(c: any) { return c.role === "EMPLOYER"; })
    : conversations.filter(function(c: any) { return c.role === "STUDENT"; });

  var newChatContacts = newChatType === "EMPLOYER" ? employers : students;
  var filteredNewChat = newChatSearch
    ? newChatContacts.filter(function(u: any) { return (u.fullName||"").toLowerCase().includes(newChatSearch.toLowerCase()) || (u.company||"").toLowerCase().includes(newChatSearch.toLowerCase()); })
    : newChatContacts;

  return (
    <div className="flex h-full bg-[#f5f6fa]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:none} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes popIn { 0%{transform:scale(0.9);opacity:0} 100%{transform:scale(1);opacity:1} }
        .msg-in { animation: fadeIn 0.25s ease both; }
        .conv-item { animation: slideIn 0.3s ease both; }
        .online-dot { animation: pulse 2s infinite; }
        .modal-in { animation: popIn 0.2s ease; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
      `}</style>

     
{/* LEFT PANEL */}
<div className="w-[340px] bg-white border-r flex flex-col flex-shrink-0 shadow-sm">
  {/* Header */}
  <div className="px-4 py-3 border-b bg-gradient-to-r from-emerald-500/5 to-transparent flex items-center justify-between">
    <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5" style={{ fontFamily: "'Syne', sans-serif" }}>💬 Messages</h2>
    <button onClick={function(){loadContacts();setShowNewChat(true)}}
      className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 text-white flex items-center justify-center text-base hover:shadow-lg transition-all">+</button>
  </div>
  
  {/* Search Bar */}
  <div className="px-4 py-2">
    <input type="text" placeholder="Search..." value={searchTerm} onChange={function(e: any){setSearchTerm(e.target.value)}}
      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-400 transition-all" />
  </div>

  {/* TOGGLE - Same style as New Message modal */}
  <div className="px-3 pb-3">
    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
      <button 
        onClick={function(){setActiveToggle("all")}}
        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
          activeToggle === "all" 
            ? "bg-white text-emerald-600 shadow-sm" 
            : "text-slate-500 hover:bg-white/50"
        }`}
      >
        💬 All
      </button>
      <button 
        onClick={function(){setActiveToggle("employers")}}
        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
          activeToggle === "employers" 
            ? "bg-white text-violet-600 shadow-sm" 
            : "text-slate-500 hover:bg-white/50"
        }`}
      >
        🏢 Companies
      </button>
      <button 
        onClick={function(){setActiveToggle("students")}}
        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
          activeToggle === "students" 
            ? "bg-white text-emerald-600 shadow-sm" 
            : "text-slate-500 hover:bg-white/50"
        }`}
      >
        👨‍🎓 Students
      </button>
    </div>
  </div>

  {/* Count Display */}
  <div className="px-4 pb-2">
    <p className="text-[10px] text-slate-400">
      {activeToggle === "all" && `📬 ${conversations.length} total conversations`}
      {activeToggle === "employers" && `🏢 ${conversations.filter(function(c:any){return c.role==="EMPLOYER"}).length} companies`}
      {activeToggle === "students" && `👨‍🎓 ${conversations.filter(function(c:any){return c.role==="STUDENT"}).length} students`}
    </p>
  </div>

  {/* Conversation List */}
  <div className="flex-1 overflow-y-auto">
    {filteredConversations.length === 0 ? (
      <div className="p-8 text-center">
        <span className="text-4xl block mb-3">💬</span>
        <p className="text-slate-400 text-sm">No conversations</p>
        <p className="text-slate-400 text-xs mt-1">Click + to start a new chat</p>
      </div>
    ) : (
      filteredConversations.map(function(conv: any, i: number) {
        return (
          <div key={conv.id} onClick={function(){startConversation(conv.id)}}
            className={"conv-item flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 border-l-[3px] "+(userId===conv.id?"bg-emerald-500/5 border-l-emerald-500":"border-l-transparent")}
            style={{animationDelay:(i*0.02)+"s"}}>
            <div className={"w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow flex-shrink-0 "+(conv.role==="EMPLOYER"?"bg-gradient-to-br from-violet-500 to-purple-600":"bg-gradient-to-br from-emerald-400 to-teal-500")}>
              {conv.name?.charAt(0)||"U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{conv.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{conv.lastMessage||"Start chatting..."}</p>
            </div>
            {conv.unread > 0 && <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">{conv.unread}</span>}
          </div>
        );
      })
    )}
  </div>
</div>

            {/* RIGHT PANEL - WHATSAPP STYLE */}
      <div className="flex-1 flex flex-col bg-[#e5ddd5]" style={{
        backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7z\" fill=\"%23d4d4d4\" fill-opacity=\"0.4\"/%3E%3C/svg%3E')",
        backgroundSize: "400px"
      }}>
        {!userId ? (
          <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💬</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-600">Messages</h2>
              <p className="text-gray-400 text-sm mt-1">Chat with employers & students</p>
              <button onClick={function(){loadContacts();setShowNewChat(true)}}
                className="mt-4 px-5 py-2.5 bg-[#25D366] text-white text-sm font-bold rounded-full hover:bg-[#22c35e] transition-all shadow">+ New Chat</button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-[#f0f2f5] border-b border-gray-200 px-4 py-2 flex items-center gap-3 shadow-sm flex-shrink-0">
              <div className={"w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow " + 
                (selectedUser?.role === "EMPLOYER" ? "bg-gradient-to-br from-violet-500 to-purple-600" : "bg-gradient-to-br from-emerald-400 to-teal-500")}>
                {selectedUser?.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{selectedUser?.name || "User"}</p>
                <p className="text-[11px] text-gray-500">{selectedUser?.role === "EMPLOYER" ? "🏢 " + (selectedUser?.company || "Company") : "👨‍🎓 Student"}</p>
              </div>
              <button className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500">⋮</button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 md:px-16 py-4 space-y-1">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full"><p className="text-gray-400 text-sm">Send a message to start!</p></div>
              ) : (
                messages.map(function(msg: any) {
                  var isMine = msg.senderId === currentUserId;
                  return (
                    <div key={msg.id} className={"msg-in flex " + (isMine ? "justify-end" : "justify-start") + " mt-1"}>
                      <div className="max-w-[65%]">
                        <div className={"px-3 py-2 text-[14px] leading-relaxed shadow-sm " + 
                          (isMine ? "bg-[#d9fdd3] text-[#111b21] rounded-lg" : "bg-white text-[#111b21] rounded-lg")}>
                          {msg.text}
                        </div>
                        <div className={"flex items-center gap-0.5 mt-0.5 " + (isMine ? "justify-end" : "justify-start")}>
                          <span className="text-[10px] text-gray-500">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMine && (
                            <svg className="w-3.5 h-3.5 text-[#53bdeb]" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-[#f0f2f5] px-4 py-2 flex items-center gap-3 flex-shrink-0">
              <button className="w-9 h-9 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 text-lg">😊</button>
              <button className="w-9 h-9 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 text-lg">📎</button>
              <input value={newMessage} onChange={function(e: any){setNewMessage(e.target.value)}} onKeyDown={function(e: any){if(e.key==="Enter")sendMessage()}}
                placeholder="Type a message" className="flex-1 px-4 py-2 rounded-lg bg-white text-sm outline-none shadow-sm" />
              {newMessage.trim() ? (
                <button onClick={sendMessage} className="w-9 h-9 rounded-full bg-[#25D366] hover:bg-[#22c35e] flex items-center justify-center text-white text-sm shadow">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
              ) : (
                <button className="w-9 h-9 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 text-lg">🎤</button>
              )}
            </div>
          </>
        )}
      </div>

      {/* NEW CHAT MODAL */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center" onClick={function(){setShowNewChat(false)}}>
          <div className="bg-white rounded-3xl p-6 w-[480px] max-h-[600px] overflow-hidden flex flex-col shadow-2xl modal-in" onClick={function(e:any){e.stopPropagation()}}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-slate-900" style={{fontFamily:"'Syne',sans-serif"}}>New Message</h3>
              <button onClick={function(){setShowNewChat(false)}} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all text-sm">✕</button>
            </div>
            <div className="flex gap-2 mb-4 p-1 bg-slate-100 rounded-xl">
              <button onClick={function(){setNewChatType("EMPLOYER")}}
                className={"flex-1 py-2.5 rounded-lg text-sm font-bold transition-all " + (newChatType === "EMPLOYER" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500")}>
                🏢 Companies
              </button>
              <button onClick={function(){setNewChatType("STUDENT")}}
                className={"flex-1 py-2.5 rounded-lg text-sm font-bold transition-all " + (newChatType === "STUDENT" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500")}>
                👨‍🎓 Students
              </button>
            </div>
            <input type="text" placeholder={"Search " + (newChatType === "EMPLOYER" ? "companies..." : "students...")} value={newChatSearch}
              onChange={function(e: any){setNewChatSearch(e.target.value)}}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400 mb-3" />
            <div className="flex-1 overflow-y-auto space-y-1">
              {filteredNewChat.map(function(u: any) {
                return (
                  <div key={u.id} onClick={function(){startNewChat(u.id, u.fullName, u.role, u.company)}}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-all">
                    <div className={"w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow flex-shrink-0 " + 
                      (u.role === "EMPLOYER" ? "bg-gradient-to-br from-violet-500 to-purple-600" : "bg-gradient-to-br from-emerald-400 to-teal-500")}>
                      {u.avatarInitials || u.fullName?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{u.fullName}</p>
                      <p className="text-[10px] text-slate-500">
                        {u.role === "EMPLOYER" ? "🏢 " + (u.company || "Company") : "👨‍🎓 " + (u.department || u.college || "Student")}
                      </p>
                    </div>
                    <span className="text-emerald-500 text-xl">→</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 