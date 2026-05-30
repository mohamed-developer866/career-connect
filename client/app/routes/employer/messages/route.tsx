import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { io } from "socket.io-client";

export default function EmployerMessages() {
  var navigate = useNavigate();
  var params = useParams();
  var userId = params["*"] || null;
  var currentUserId = (function() { try { return JSON.parse(localStorage.getItem("user") || "{}").id; } catch(e) { return null; } })();
  var [conversations, setConversations] = useState<any[]>([]);
  var [messages, setMessages] = useState<any[]>([]);
  var [colleges, setColleges] = useState<any[]>([]);
  var [newMessage, setNewMessage] = useState("");
  var [selectedUser, setSelectedUser] = useState<any>(null);
  var [searchTerm, setSearchTerm] = useState("");
  var [showSearch, setShowSearch] = useState(false);
  var messagesEndRef = useRef<any>(null);

  useEffect(function() { loadConversations(); loadColleges(); }, []);
  useEffect(function() { if (userId) { setMessages([]); loadMessages(userId); } }, [userId]);
  useEffect(function() { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(function() {
    if (!currentUserId) return;
    var socket = io("http://localhost:5000");
    socket.emit('join', currentUserId);
    socket.on('newMessage', function(msg: any) {
      if (userId && (msg.senderId === userId || msg.receiverId === userId)) {
        setMessages(function(prev: any) { return [...prev, msg]; });
      }
      loadConversations();
    });
    return function() { socket.disconnect(); };
  }, [userId, currentUserId]);

  var loadConversations = async function() {
    var token = localStorage.getItem("token");
    var res = await fetch("http://localhost:5000/api/messages/conversations", { headers: { Authorization: "Bearer " + token } });
    if (res.ok) {
      var data = await res.json();
      setConversations((data.conversations || []).filter(function(c: any) { return c.id !== currentUserId; }));
    }
  };

  var loadColleges = async function() {
    var token = localStorage.getItem("token");
    var res = await fetch("http://localhost:5000/api/college/rankings", { headers: { Authorization: "Bearer " + token } });
    if (res.ok) setColleges((await res.json()).colleges || []);
  };

  var loadMessages = async function(otherId: string) {
    var token = localStorage.getItem("token");
    var res = await fetch("http://localhost:5000/api/messages/conversations/" + otherId, { headers: { Authorization: "Bearer " + token } });
    if (res.ok) {
      var data = await res.json();
      setMessages(data.messages || []);
      var user = conversations.find(function(c: any) { return c.id === otherId; }) || colleges.find(function(c: any) { return c.id === otherId; });
      setSelectedUser(user || { id: otherId, name: "College", college: "College TPO" });
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
    setNewMessage("");
    loadMessages(userId);
    loadConversations();
  };

  var startConversation = function(collegeId: string, collegeName: string) {
    setSelectedUser({ id: collegeId, name: collegeName, college: collegeName });
    navigate("/employer/messages/" + collegeId);
    setShowSearch(false);
  };

  var filteredColleges = searchTerm
    ? colleges.filter(function(c: any) { return (c.name || c.college || "").toLowerCase().includes(searchTerm.toLowerCase()); })
    : colleges;

  // Group messages by date
  var groupedMessages: any = {};
  messages.forEach(function(msg: any) {
    var date = new Date(msg.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    if (!groupedMessages[date]) groupedMessages[date] = [];
    groupedMessages[date].push(msg);
  });

  return (
    <div className="flex h-full bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:none} }
        @keyframes typing { 0%{opacity:0.3} 50%{opacity:1} 100%{opacity:0.3} }
        .msg-in { animation: fadeIn 0.2s ease both; }
        .conv-item { animation: slideIn 0.2s ease both; }
        .typing-dot:nth-child(1){animation:typing 1.4s 0s infinite}.typing-dot:nth-child(2){animation:typing 1.4s 0.2s infinite}.typing-dot:nth-child(3){animation:typing 1.4s 0.4s infinite}
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #c4c4c4; border-radius: 4px; }
      `}</style>

      {/* LEFT PANEL - Chat List */}
      <div className="w-[380px] border-r border-gray-200 flex flex-col flex-shrink-0 bg-white">
        {/* Header */}
        <div className="px-4 py-3 bg-[#f0f2f5] flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Messages</h2>
          <div className="flex gap-2">
            <button onClick={function(){ setShowSearch(!showSearch); loadColleges(); }}
              className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all shadow-sm"
              title="New chat">+</button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 bg-white border-b border-gray-100">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="Search or start new chat" value={searchTerm}
              onChange={function(e: any) { setSearchTerm(e.target.value); }}
              className="w-full bg-[#f0f2f5] rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#6c47ff]/20 transition-all" />
          </div>
        </div>

        {/* College Search Panel */}
        {showSearch && (
          <div className="border-b bg-[#f0f2f5] p-3 space-y-1.5 max-h-[250px] overflow-y-auto">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold px-1">Colleges</p>
            {filteredColleges.map(function(college: any) {
              return (
                <div key={college.id} onClick={function() { startConversation(college.id, college.name || college.college); }}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-all border border-transparent hover:border-[#6c47ff]/20">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow flex-shrink-0">{(college.name||college.college||"C").charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{college.name||college.college}</p>
                    <p className="text-[11px] text-gray-400">{college.totalStudents||0} students</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length===0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No conversations yet</div>
          ) : (
            conversations.map(function(conv: any, i: number) {
              return (
                <div key={conv.id} onClick={function() { startConversation(conv.id, conv.name); }}
                  className={"conv-item flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#f0f2f5] transition-all " + (userId===conv.id ? "bg-[#f0f2f5]" : "")}
                  style={{animationDelay:(i*0.02)+"s"}}>
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold shadow">{(conv.name||"C").charAt(0)}</div>
                    {conv.unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#25D366] border-2 border-white"></span>}
                  </div>
                  <div className="flex-1 min-w-0 border-b border-gray-100 pb-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800 truncate">{conv.name}</p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{new Date(conv.time).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[12px] text-gray-500 truncate mt-0.5">{conv.lastMessage||"Start chatting..."}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL - WHATSAPP STYLE CHAT */}
      <div className="flex-1 flex flex-col bg-[#e5ddd5]" style={{
        backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z\" fill=\"%23d4d4d4\" fill-opacity=\"0.4\"/%3E%3C/svg%3E')",
        backgroundSize: "400px"
      }}>
        {!userId ? (
          <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💬</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-600">CareerConnect Messages</h2>
              <p className="text-gray-400 text-sm mt-1">Select a college to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header - WhatsApp Style */}
            <div className="bg-[#f0f2f5] border-b border-gray-200 px-4 py-2 flex items-center gap-3 shadow-sm flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow">{(selectedUser?.name||"C").charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{selectedUser?.name||"College"}</p>
                <p className="text-[11px] text-gray-500">online</p>
              </div>
              <div className="flex gap-1">
                <button className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all" title="Search">🔍</button>
                <button className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all" title="More">⋮</button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 md:px-16 py-4 space-y-1">
              {messages.length===0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-sm">Send a message to start the conversation</p>
                </div>
              ) : (
                Object.keys(groupedMessages).map(function(date) {
                  return (
                    <div key={date}>
                      {/* Date Separator */}
                      <div className="flex justify-center my-4">
                        <span className="px-3 py-1 bg-white/80 backdrop-blur rounded-lg text-[11px] text-gray-500 shadow-sm font-medium">{date}</span>
                      </div>
                      {groupedMessages[date].map(function(msg: any, i: number) {
                        var isMine = msg.senderId === currentUserId;
                        var prevSender = i > 0 ? groupedMessages[date][i-1].senderId : null;
                        var showTail = i === groupedMessages[date].length - 1 || groupedMessages[date][i+1]?.senderId !== msg.senderId;
                        return (
                          <div key={msg.id} className={"msg-in flex " + (isMine ? "justify-end" : "justify-start") + (prevSender !== msg.senderId ? " mt-2" : " mt-0.5")}>
                            <div className={"max-w-[65%] relative group " + (showTail ? (isMine ? "rounded-tr-sm" : "rounded-tl-sm") : "")}>
                              <div className={"px-3 py-2 text-[14px] leading-relaxed shadow-sm " + 
                                (isMine 
                                  ? "bg-[#d9fdd3] text-[#111b21] rounded-lg" 
                                  : "bg-white text-[#111b21] rounded-lg")}>
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
                      })}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef}/>
            </div>

            {/* Input Bar - WhatsApp Style */}
            <div className="bg-[#f0f2f5] px-4 py-2 flex items-center gap-3 flex-shrink-0">
              <button className="w-9 h-9 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all text-lg">😊</button>
              <button className="w-9 h-9 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all text-lg">📎</button>
              <div className="flex-1 relative">
                <input value={newMessage} onChange={function(e: any){setNewMessage(e.target.value)}} onKeyDown={function(e: any){if(e.key==="Enter")sendMessage()}}
                  placeholder="Type a message"
                  className="w-full px-4 py-2 rounded-lg bg-white text-sm outline-none shadow-sm" />
              </div>
              {newMessage.trim() ? (
                <button onClick={sendMessage}
                  className="w-9 h-9 rounded-full bg-[#25D366] hover:bg-[#22c35e] flex items-center justify-center text-white text-sm transition-all shadow">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
              ) : (
                <button className="w-9 h-9 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all text-lg">🎤</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}