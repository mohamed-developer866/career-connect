import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router";
import Sidebar from "../../../components/Sidebar";
import { io } from "socket.io-client";

export default function StudentMessages() {
  const { user } = useOutletContext<any>();
  var [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  var currentUserId = (function() { 
    try { return JSON.parse(localStorage.getItem("user") || "{}").id; 
    } catch(e) { return null; } 
  })();
  var [activeTab, setActiveTab] = useState("tpo");
  var [messages, setMessages] = useState<any[]>([]);
  var [broadcasts, setBroadcasts] = useState<any[]>([]);
  var [newMessage, setNewMessage] = useState("");
  var [loading, setLoading] = useState(true);
  var [tpoUser, setTpoUser] = useState<any>(null);
  var [isTyping, setIsTyping] = useState(false);
  var [typing, setTyping] = useState(false);
  var messagesEndRef = useRef<any>(null);
  var typingTimeoutRef = useRef<any>(null);
  var socketRef = useRef<any>(null);
  var isSendingRef = useRef(false);
  var messageIdsRef = useRef<Set<string>>(new Set());

  var formatMessageTime = function(dateString: string) {
    var date = new Date(dateString);
    var now = new Date();
    var diff = now.getTime() - date.getTime();
    var hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  useEffect(function() { loadData(); }, []);
  useEffect(function() { 
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages]);

  useEffect(function() {
    if (!currentUserId || !tpoUser) return;
    
    socketRef.current = io("http://localhost:5000");
    socketRef.current.emit('join', currentUserId);

    socketRef.current.on('newMessage', function(msg: any) {
      if (msg.senderId === tpoUser.id && msg.receiverId === currentUserId) {
        if (!messageIdsRef.current.has(msg.id)) {
          messageIdsRef.current.add(msg.id);
          setMessages(function(prev) { 
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg]; 
          });
        }
      }
    });

    socketRef.current.on('typing', function(data: any) {
      if (data.senderId === tpoUser.id) {
        setIsTyping(true);
        setTimeout(function() { setIsTyping(false); }, 1500);
      }
    });

    socketRef.current.on('newBroadcast', function(broadcast: any) {
      setBroadcasts(function(prev) { 
        if (prev.some(b => b.id === broadcast.id)) return prev;
        return [broadcast, ...prev];
      });
    });

    return function() { 
      if (socketRef.current) {
        socketRef.current.off('newMessage');
        socketRef.current.off('typing');
        socketRef.current.off('newBroadcast');
        socketRef.current.disconnect();
      }
    };
  }, [currentUserId, tpoUser]);

  var handleTyping = function() {
    if (!typing && socketRef.current && tpoUser) {
      setTyping(true);
      socketRef.current.emit('typing', { receiverId: tpoUser.id, senderId: currentUserId });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(function() {
        setTyping(false);
      }, 1000);
    }
  };

  var loadData = async function() {
    var token = localStorage.getItem("token");
    var headers = { Authorization: "Bearer " + token };
    setLoading(true);
    messageIdsRef.current.clear();
    
    try {
      var tpoRes = await fetch("http://localhost:5000/api/messages/users?role=COLLEGE", { headers });
      if (tpoRes.ok) {
        var tpoData = await tpoRes.json();
        var tpo = (tpoData.users || [])[0];
        if (tpo) {
          setTpoUser(tpo);
          var msgRes = await fetch("http://localhost:5000/api/messages/conversations/" + tpo.id, { headers });
          if (msgRes.ok) {
            var msgData = await msgRes.json();
            var loadedMessages = msgData.messages || [];
            loadedMessages.forEach(function(msg: any) {
              messageIdsRef.current.add(msg.id);
            });
            setMessages(loadedMessages);
          }
        }
      }

      var broadRes = await fetch("http://localhost:5000/api/broadcast", { headers });
      if (broadRes.ok) {
        var bData = await broadRes.json();
        setBroadcasts(bData.broadcasts || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  var sendMessage = async function() {
    if (isSendingRef.current) return;
    if (!newMessage.trim() || !tpoUser) return;
    
    isSendingRef.current = true;
    var token = localStorage.getItem("token");
    var messageText = newMessage.trim();
    setNewMessage("");
    
    try {
      var res = await fetch("http://localhost:5000/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ receiverId: tpoUser.id, text: messageText })
      });
      
      if (res.ok) {
        var sentMsg = await res.json();
        if (!messageIdsRef.current.has(sentMsg.id)) {
          messageIdsRef.current.add(sentMsg.id);
          setMessages(function(prev) {
            if (prev.some(m => m.id === sentMsg.id)) return prev;
            return [...prev, sentMsg];
          });
        }
      }
    } catch (err) { console.error(err); }
    finally { isSendingRef.current = false; }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={function(){setSidebarCollapsed(!sidebarCollapsed)}} />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay:"0.15s"}}></div>
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay:"0.3s"}}></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Syne:wght@600;700;800&display=swap');
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-15px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(15px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .message-in {
          animation: slideInLeft 0.25s ease both;
        }
        
        .message-out {
          animation: slideInRight 0.25s ease both;
        }
        
        /* WhatsApp style bubbles - rectangular with slight rounding */
        .bubble-in {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
        }
        
        .bubble-out {
          background: #dcf8c5;
          border-radius: 12px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
        }
        
        .typing-dot {
          animation: bounce 1.4s infinite;
        }
        
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        
        .glass-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
        }
        
        .tab-active {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
        }
        
        .send-btn {
          transition: all 0.2s ease;
        }
        
        .send-btn:hover:not(:disabled) {
          transform: scale(1.02);
        }
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
      
      <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={function(){setSidebarCollapsed(!sidebarCollapsed)}} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="glass-header border-b border-indigo-100 px-5 py-3 flex-shrink-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                  <span className="text-base">💬</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-indigo-800" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Messages
                </h1>
                <p className="text-[10px] text-indigo-500 mt-0.5">
                  {activeTab === "tpo" ? "Chat with your Placement Officer" : "Official announcements"}
                </p>
              </div>
            </div>
            
            <div className="flex gap-1.5 bg-white/60 rounded-lg p-0.5">
              <button 
                onClick={function(){setActiveTab("tpo")}}
                className={`px-4 py-1.5 rounded-md text-[10px] font-semibold transition-all flex items-center gap-1 ${
                  activeTab === "tpo" 
                    ? "tab-active" 
                    : "text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                <span>💬</span> Chat
              </button>
              <button 
                onClick={function(){setActiveTab("broadcast")}}
                className={`px-4 py-1.5 rounded-md text-[10px] font-semibold transition-all flex items-center gap-1 ${
                  activeTab === "broadcast" 
                    ? "tab-active" 
                    : "text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                <span>📢</span> Announcements
                {broadcasts.length > 0 && (
                  <span className="bg-amber-500 text-white text-[8px] px-1 py-0.5 rounded-full ml-1">
                    {broadcasts.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-3">
          <div className="max-w-5xl mx-auto h-full">
            
            {/* Chat Section */}
            {activeTab === "tpo" && tpoUser && (
              <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-indigo-100 overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-sm shadow-inner">
                      {tpoUser?.fullName?.charAt(0) || "T"}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white"></span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{tpoUser?.fullName || "Placement Officer"}</p>
                    <p className="text-white/70 text-[9px] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Online • Placement Cell
                    </p>
                  </div>
                </div>

                {/* Messages Area - WhatsApp Style */}
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 bg-[#f0f2f5]">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl">👋</span>
                        </div>
                        <h3 className="text-sm font-semibold text-indigo-700 mb-1">Start a Conversation</h3>
                        <p className="text-xs text-slate-500 max-w-sm">Message your TPO for placement guidance</p>
                      </div>
                    </div>
                  ) : (
                    messages.map(function(msg: any, idx: number) {
                      var isMine = msg.senderId === currentUserId;
                      var showAvatar = idx === 0 || messages[idx-1]?.senderId !== msg.senderId;
                      
                      return (
                        <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"} ${isMine ? "message-out" : "message-in"}`}>
                          <div className="max-w-[70%]">
                            {!isMine && showAvatar && (
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[7px] font-bold">
                                  {tpoUser?.fullName?.charAt(0) || "T"}
                                </div>
                                <span className="text-[9px] text-indigo-600 font-medium">{tpoUser?.fullName?.split(' ')[0]}</span>
                              </div>
                            )}
                            <div className={`relative px-3 py-2 text-sm leading-relaxed ${isMine ? "bubble-out" : "bubble-in"}`}>
                              {msg.text}
                            </div>
                            <div className={`flex items-center gap-1 mt-0.5 ${isMine ? "justify-end" : "justify-start"}`}>
                              <span className="text-[9px] text-slate-400">
                                {formatMessageTime(msg.createdAt)}
                              </span>
                              {isMine && (
                                <svg className="w-2.5 h-2.5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start message-in">
                      <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                        <div className="flex gap-1">
                          <span className="typing-dot text-indigo-500 text-base" style={{animationDelay: '0s'}}>•</span>
                          <span className="typing-dot text-indigo-500 text-base" style={{animationDelay: '0.2s'}}>•</span>
                          <span className="typing-dot text-indigo-500 text-base" style={{animationDelay: '0.4s'}}>•</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="bg-white border-t border-gray-200 px-3 py-2 flex items-center gap-2 flex-shrink-0">
                  <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 text-base transition-all">
                    😊
                  </button>
                  <div className="flex-1 relative">
                    <input 
                      value={newMessage} 
                      onChange={function(e: any){setNewMessage(e.target.value); handleTyping();}} 
                      onKeyDown={function(e: any){if(e.key==="Enter" && !isSendingRef.current) sendMessage();}}
                      placeholder="Type a message..."
                      className="w-full px-3 py-2 rounded-lg bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isSendingRef.current}
                    className="w-8 h-8 rounded-full bg-indigo-500 hover:bg-indigo-600 flex items-center justify-center text-white transition-all disabled:opacity-50 send-btn"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Broadcasts Section */}
            {activeTab === "broadcast" && (
              <div className="h-full overflow-y-auto space-y-3 pr-2">
                <div className="bg-white rounded-lg border border-indigo-100 p-3 shadow-sm sticky top-0 z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-indigo-800" style={{ fontFamily: "'Syne', sans-serif" }}>
                        📢 Announcements
                      </h2>
                      <p className="text-[10px] text-indigo-500">Official updates from Placement Office</p>
                    </div>
                    {broadcasts.length > 0 && (
                      <span className="text-[8px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                        {broadcasts.length} new
                      </span>
                    )}
                  </div>
                </div>

                {broadcasts.length === 0 ? (
                  <div className="bg-white rounded-lg border border-indigo-100 p-8 text-center shadow-sm">
                    <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl">📢</span>
                    </div>
                    <h3 className="text-sm font-bold text-indigo-700 mb-1">No Announcements Yet</h3>
                    <p className="text-xs text-slate-500">Updates will appear here</p>
                  </div>
                ) : (
                  broadcasts.map(function(broadcast: any, index: number) {
                    var displayText = broadcast.text || broadcast.message || "";
                    if (displayText.startsWith("📢 ")) displayText = displayText.replace("📢 ", "");
                    return (
                      <div key={broadcast.id || index} 
                        className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all ${
                          index === 0 ? "border-l-4 border-l-indigo-500" : "border border-indigo-100"
                        }`}>
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-base shadow-sm flex-shrink-0">
                            📢
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                              {index === 0 && (
                                <span className="text-[8px] font-bold text-white bg-indigo-500 px-1.5 py-0.5 rounded-full">NEW</span>
                              )}
                              <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">ANNOUNCEMENT</span>
                              <span className="text-[8px] text-indigo-500 font-medium">Placement Office</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed font-medium">{displayText}</p>
                            <div className="flex items-center gap-2 mt-1.5 pt-1 border-t border-indigo-50 text-[8px] text-indigo-500">
                              <span>📅 {broadcast.createdAt ? new Date(broadcast.createdAt).toLocaleDateString() : "Today"}</span>
                              <span>🕐 {broadcast.createdAt ? new Date(broadcast.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Now"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}