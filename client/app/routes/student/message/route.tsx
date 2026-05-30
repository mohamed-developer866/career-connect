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
  
  // Store message IDs to prevent duplicates
  var messageIdsRef = useRef<Set<string>>(new Set());

  // Format time
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

  // Socket connection - ONLY for receiving real-time messages
  useEffect(function() {
    if (!currentUserId || !tpoUser) return;
    
    socketRef.current = io("http://localhost:5000");
    socketRef.current.emit('join', currentUserId);

    // Receive new message - NO duplicate check needed here because we rely on API refresh
    socketRef.current.on('newMessage', function(msg: any) {
      // Only handle if it's from TPO and not a duplicate
      if (msg.senderId === tpoUser.id && msg.receiverId === currentUserId) {
        // Check if message already exists
        if (!messageIdsRef.current.has(msg.id)) {
          messageIdsRef.current.add(msg.id);
          setMessages(function(prev) { 
            // Final check to prevent any duplicate
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg]; 
          });
        }
      }
    });

    // Typing indicator
    socketRef.current.on('typing', function(data: any) {
      if (data.senderId === tpoUser.id) {
        setIsTyping(true);
        setTimeout(function() { setIsTyping(false); }, 1500);
      }
    });

    // Broadcasts
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
    
    // Clear message IDs on new load
    messageIdsRef.current.clear();
    
    try {
      // Load TPO
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
            
            // Add IDs to Set
            loadedMessages.forEach(function(msg: any) {
              messageIdsRef.current.add(msg.id);
            });
            
            setMessages(loadedMessages);
          }
        }
      }

      // Load broadcasts
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
    
    // Clear input immediately
    setNewMessage("");
    
    try {
      var res = await fetch("http://localhost:5000/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ receiverId: tpoUser.id, text: messageText })
      });
      
      if (res.ok) {
        var sentMsg = await res.json();
        
        // Check if message already exists before adding
        if (!messageIdsRef.current.has(sentMsg.id)) {
          messageIdsRef.current.add(sentMsg.id);
          setMessages(function(prev) {
            // Final duplicate check
            if (prev.some(m => m.id === sentMsg.id)) return prev;
            return [...prev, sentMsg];
          });
        }
      }
    } catch (err) { 
      console.error(err);
    } finally {
      isSendingRef.current = false;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={function(){setSidebarCollapsed(!sidebarCollapsed)}} />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-bounce"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-bounce" style={{animationDelay:"0.15s"}}></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-bounce" style={{animationDelay:"0.3s"}}></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800&display=swap');
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes typingDots {
          0%, 20% { opacity: 0; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-4px); }
          80%, 100% { opacity: 0; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .message-in {
          animation: slideInLeft 0.25s ease both;
        }
        
        .message-out {
          animation: slideInRight 0.25s ease both;
        }
        
        .chat-bubble-in {
          background: white;
          border-radius: 20px 20px 20px 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .chat-bubble-out {
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 20px 20px 4px 20px;
          box-shadow: 0 2px 12px rgba(16, 185, 129, 0.25);
        }
        
        .typing-dot {
          animation: typingDots 1.4s infinite;
        }
        
        .online-dot {
          animation: pulse 2s infinite;
        }
        
        .glass-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
        }
        
        .tab-active {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.3); border-radius: 10px; }
      `}</style>
      
      <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={function(){setSidebarCollapsed(!sidebarCollapsed)}} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="glass-header border-b border-emerald-100 px-6 py-4 flex-shrink-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-200">
                  💬
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white online-dot"></div>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-emerald-800" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Messages
                </h1>
                <p className="text-xs text-emerald-600 font-medium mt-0.5">
                  {activeTab === "tpo" ? "Chat with your Placement Officer" : "Official announcements from TPO"}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 bg-white/60 rounded-2xl p-1 shadow-sm">
              <button 
                onClick={function(){setActiveTab("tpo")}}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === "tpo" 
                    ? "tab-active" 
                    : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                <span>💬</span> Chat
              </button>
              <button 
                onClick={function(){setActiveTab("broadcast")}}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === "broadcast" 
                    ? "tab-active" 
                    : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                <span>📢</span> Announcements
                {broadcasts.length > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1 animate-pulse">
                    {broadcasts.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="max-w-5xl mx-auto h-full">
            
            {/* CHAT SECTION */}
            {activeTab === "tpo" && tpoUser && (
              <div className="flex flex-col h-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 flex items-center gap-4 flex-shrink-0">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-lg shadow-inner">
                      {tpoUser?.fullName?.charAt(0) || "T"}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white online-dot"></span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {tpoUser?.fullName || "Placement Officer"}
                    </p>
                    <p className="text-white/80 text-xs font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-300 online-dot"></span>
                      Online • Placement Cell
                    </p>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-2" style={{
                  background: "linear-gradient(180deg, #e8f5e9 0%, #c8e6c9 100%)"
                }}>
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-4 shadow-inner">
                          <span className="text-4xl">👋</span>
                        </div>
                        <h3 className="text-lg font-bold text-emerald-800 mb-2">Start a Conversation</h3>
                        <p className="text-emerald-600 text-sm max-w-sm">Message your TPO for placement guidance</p>
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
                              <div className="flex items-center gap-2 mb-1 ml-1">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-[8px] font-bold">
                                  {tpoUser?.fullName?.charAt(0) || "T"}
                                </div>
                                <span className="text-[10px] text-emerald-600 font-medium">{tpoUser?.fullName?.split(' ')[0]}</span>
                              </div>
                            )}
                            <div className={`relative px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                              isMine 
                                ? "chat-bubble-out text-white" 
                                : "chat-bubble-in text-gray-700"
                            }`}>
                              {msg.text}
                            </div>
                            <div className={`flex items-center gap-1 mt-1 px-1 ${isMine ? "justify-end" : "justify-start"}`}>
                              <span className="text-[9px] text-emerald-500 font-medium">
                                {formatMessageTime(msg.createdAt)}
                              </span>
                              {isMine && (
                                <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
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
                      <div className="bg-white rounded-2xl px-4 py-2.5 shadow-sm">
                        <div className="flex gap-1">
                          <span className="typing-dot text-emerald-500 text-lg" style={{animationDelay: '0s'}}>•</span>
                          <span className="typing-dot text-emerald-500 text-lg" style={{animationDelay: '0.2s'}}>•</span>
                          <span className="typing-dot text-emerald-500 text-lg" style={{animationDelay: '0.4s'}}>•</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="bg-white border-t border-emerald-100 px-4 py-3 flex items-center gap-2 flex-shrink-0">
                  <button className="w-10 h-10 rounded-full hover:bg-emerald-50 flex items-center justify-center text-emerald-500 text-xl transition-all">
                    😊
                  </button>
                  <div className="flex-1 relative">
                    <input 
                      value={newMessage} 
                      onChange={function(e: any){setNewMessage(e.target.value); handleTyping();}} 
                      onKeyDown={function(e: any){if(e.key==="Enter" && !isSendingRef.current) sendMessage();}}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2.5 rounded-full bg-emerald-50 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition-all placeholder:text-emerald-300"
                    />
                  </div>
                  <button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isSendingRef.current}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg flex items-center justify-center text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* BROADCASTS SECTION */}
            {activeTab === "broadcast" && (
              <div className="h-full overflow-y-auto space-y-4 pr-2">
                <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm sticky top-0 z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-extrabold text-emerald-800 mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
                        📢 Announcements
                      </h2>
                      <p className="text-emerald-600 text-sm">Official updates from Placement Office</p>
                    </div>
                    {broadcasts.length > 0 && (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                        {broadcasts.length} new
                      </span>
                    )}
                  </div>
                </div>

                {broadcasts.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-emerald-100 p-12 text-center shadow-sm">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-5">
                      <span className="text-5xl">📢</span>
                    </div>
                    <h3 className="text-lg font-bold text-emerald-800 mb-2">No Announcements Yet</h3>
                    <p className="text-emerald-600 text-sm">Updates will appear here</p>
                  </div>
                ) : (
                  broadcasts.map(function(broadcast: any, index: number) {
                    var displayText = broadcast.text || broadcast.message || "";
                    if (displayText.startsWith("📢 ")) displayText = displayText.replace("📢 ", "");
                    return (
                      <div key={broadcast.id || index} 
                        className={`bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all ${
                          index === 0 ? "border-l-4 border-l-emerald-500" : "border border-emerald-100"
                        }`}>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xl shadow-md flex-shrink-0">
                            📢
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {index === 0 && (
                                <span className="text-xs font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full">NEW</span>
                              )}
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">ANNOUNCEMENT</span>
                              <span className="text-xs text-emerald-500 font-medium">Placement Office</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed font-medium">{displayText}</p>
                            <div className="flex items-center gap-3 mt-3 pt-2 text-xs text-emerald-500">
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