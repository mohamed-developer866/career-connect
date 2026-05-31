import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { io } from "socket.io-client";

export default function EmployerMessages() {
  var navigate = useNavigate();
  var params = useParams();
  var userId = params["*"] || null;
  var currentUserId = (function() { 
    try { return JSON.parse(localStorage.getItem("user") || "{}").id; 
    } catch(e) { return null; } 
  })();
  var [conversations, setConversations] = useState<any[]>([]);
  var [messages, setMessages] = useState<any[]>([]);
  var [colleges, setColleges] = useState<any[]>([]);
  var [newMessage, setNewMessage] = useState("");
  var [selectedUser, setSelectedUser] = useState<any>(null);
  var [searchTerm, setSearchTerm] = useState("");
  var [showSearch, setShowSearch] = useState(false);
  var [isTyping, setIsTyping] = useState(false);
  var [typing, setTyping] = useState(false);
  var [loading, setLoading] = useState(true);
  var messagesEndRef = useRef<any>(null);
  var typingTimeoutRef = useRef<any>(null);
  var socketRef = useRef<any>(null);
  var isSendingRef = useRef(false);
  var messageIdsRef = useRef<Set<string>>(new Set());

  useEffect(function() { 
    loadConversations(); 
    loadColleges(); 
  }, []);
  
  useEffect(function() { 
    if (userId) { 
      setMessages([]); 
      messageIdsRef.current.clear();
      loadMessages(userId); 
    } 
  }, [userId]);
  
  useEffect(function() { 
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages]);

  // Socket connection
  useEffect(function() {
    if (!currentUserId) return;
    
    socketRef.current = io("http://localhost:5000");
    socketRef.current.emit('join', currentUserId);
    
    socketRef.current.on('newMessage', function(msg: any) {
      // Only add if not already in messages
      if (!messageIdsRef.current.has(msg.id)) {
        messageIdsRef.current.add(msg.id);
        
        // Update messages if in current conversation
        if (userId && (msg.senderId === userId || msg.receiverId === userId)) {
          setMessages(function(prev: any) { 
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, { ...msg, text: msg.content || msg.text }]; 
          });
        }
        // Refresh conversation list for unread counts
        loadConversations();
      }
    });

    socketRef.current.on('typing', function(data: any) {
      if (data.senderId === userId) {
        setIsTyping(true);
        setTimeout(function() { setIsTyping(false); }, 1500);
      }
    });

    return function() { 
      if (socketRef.current) {
        socketRef.current.off('newMessage');
        socketRef.current.off('typing');
        socketRef.current.disconnect();
      }
    };
  }, [userId, currentUserId]);

  var handleTyping = function() {
    if (!typing && socketRef.current && userId) {
      setTyping(true);
      socketRef.current.emit('typing', { receiverId: userId, senderId: currentUserId });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(function() {
        setTyping(false);
      }, 1000);
    }
  };

  var loadConversations = async function() {
    var token = localStorage.getItem("token");
    var res = await fetch("http://localhost:5000/api/messages/conversations", { 
      headers: { Authorization: "Bearer " + token } 
    });
    if (res.ok) {
      var data = await res.json();
      var collegeConversations = (data.conversations || []).filter(function(c: any) { 
        return c.role === "COLLEGE" && c.id !== currentUserId;
      });
      setConversations(collegeConversations);
    }
    setLoading(false);
  };

  var loadColleges = async function() {
    var token = localStorage.getItem("token");
    var res = await fetch("http://localhost:5000/api/college/rankings", { 
      headers: { Authorization: "Bearer " + token } 
    });
    if (res.ok) {
      var data = await res.json();
      setColleges(data.colleges || []);
    }
  };

  var loadMessages = async function(otherId: string) {
    var token = localStorage.getItem("token");
    var res = await fetch("http://localhost:5000/api/messages/conversations/" + otherId, { 
      headers: { Authorization: "Bearer " + token } 
    });
    if (res.ok) {
      var data = await res.json();
      var loadedMessages = (data.messages || []).map(function(msg: any) {
        messageIdsRef.current.add(msg.id);
        return { ...msg, text: msg.content || msg.text };
      });
      setMessages(loadedMessages);
      var user = conversations.find(function(c: any) { return c.id === otherId; }) || 
                 colleges.find(function(c: any) { return c.id === otherId; });
      setSelectedUser(user || { id: otherId, name: "College TPO", role: "COLLEGE" });
    }
  };

  // FIXED: Send message - DON'T add manually, let socket handle it
  var sendMessage = async function() {
    if (isSendingRef.current) return;
    if (!newMessage.trim() || !userId) return;
    
    isSendingRef.current = true;
    var token = localStorage.getItem("token");
    var messageText = newMessage.trim();
    setNewMessage("");
    
    try {
      var res = await fetch("http://localhost:5000/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ receiverId: userId, content: messageText })
      });
      
      if (res.ok) {
        var sentMsg = await res.json();
        
        // Just track the ID - socket will add the message
        messageIdsRef.current.add(sentMsg.id);
        
        // Refresh conversation list to update last message
        loadConversations();
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      // If failed, add back the message text
      setNewMessage(messageText);
    } finally {
      isSendingRef.current = false;
    }
  };

  var startConversation = function(collegeId: string, collegeName: string) {
    setSelectedUser({ id: collegeId, name: collegeName, role: "COLLEGE" });
    navigate("/employer/messages/" + collegeId);
    setShowSearch(false);
  };

  var filteredColleges = searchTerm
    ? colleges.filter(function(c: any) { 
        return (c.name || c.college || "").toLowerCase().includes(searchTerm.toLowerCase()); 
      })
    : colleges;

  var groupedMessages: any = {};
  messages.forEach(function(msg: any) {
    var date = new Date(msg.createdAt).toLocaleDateString('en-US', { 
      weekday: 'long', month: 'short', day: 'numeric' 
    });
    if (!groupedMessages[date]) groupedMessages[date] = [];
    groupedMessages[date].push(msg);
  });

  if (loading && conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{animationDelay: "0.15s"}}></div>
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{animationDelay: "0.3s"}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:none} }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        .msg-in { animation: fadeIn 0.2s ease both; }
        .conv-item { animation: slideIn 0.2s ease both; }
        .typing-dot { animation: bounce 1.4s infinite; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #c4c4c4; border-radius: 4px; }
      `}</style>

      {/* LEFT PANEL */}
      <div className="w-[340px] border-r border-gray-200 flex flex-col flex-shrink-0 bg-white">
        {/* Header - Blue Theme */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>💬 College Connect</h2>
              <p className="text-white/70 text-[10px] mt-0.5">Message TPOs directly</p>
            </div>
            <button onClick={function(){ setShowSearch(!showSearch); loadColleges(); }}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-base transition-all"
              title="New chat">
              +
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 bg-white border-b border-gray-100">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="Search colleges..." value={searchTerm}
              onChange={function(e: any) { setSearchTerm(e.target.value); }}
              className="w-full bg-gray-50 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all" />
          </div>
        </div>

        {/* College Search Panel */}
        {showSearch && (
          <div className="border-b bg-gray-50 p-3 space-y-1.5 max-h-[280px] overflow-y-auto">
            <p className="text-[9px] text-blue-600 uppercase tracking-wider font-semibold px-1">📚 All Colleges</p>
            {filteredColleges.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-3">No colleges found</p>
            ) : (
              filteredColleges.map(function(college: any) {
                return (
                  <div key={college.id} onClick={function() { startConversation(college.id, college.name || college.college); }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-all border border-transparent hover:border-blue-200 hover:shadow-sm">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow flex-shrink-0">
                      {(college.name || college.college || "C").charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{college.name || college.college}</p>
                      <p className="text-[10px] text-gray-400">🏛️ TPO Office</p>
                    </div>
                    <span className="text-blue-500 text-sm">→</span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">💬</span>
              </div>
              <p className="text-gray-400 text-xs">No conversations yet</p>
              <p className="text-gray-400 text-[10px] mt-1">Click + to message a college TPO</p>
            </div>
          ) : (
            conversations.map(function(conv: any, i: number) {
              var isActive = userId === conv.id;
              return (
                <div key={conv.id} onClick={function() { startConversation(conv.id, conv.name); }}
                  className={`conv-item flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-all ${isActive ? "bg-blue-50/30 border-r-4 border-blue-500" : ""}`}
                  style={{animationDelay: (i * 0.02) + "s"}}>
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow text-sm">
                      {(conv.name || "C").charAt(0)}
                    </div>
                    {conv.unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 border-b border-gray-100 pb-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-800 truncate">{conv.name}</p>
                      {conv.lastMessageAt && (
                        <span className="text-[9px] text-gray-400 flex-shrink-0">
                          {new Date(conv.lastMessageAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">
                      {conv.lastMessage || "Start chatting with TPO"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-white">
        {!userId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <span className="text-4xl">💬</span>
              </div>
              <h2 className="text-base font-bold text-gray-700" style={{ fontFamily: "'Syne', sans-serif" }}>College Messages</h2>
              <p className="text-gray-400 text-xs mt-1">Select a college TPO to start messaging</p>
              <button onClick={function(){ setShowSearch(true); loadColleges(); }}
                className="mt-3 px-4 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-all shadow-sm">
                + Message a College
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 shadow-sm flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {(selectedUser?.name || "C").charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{selectedUser?.name || "College TPO"}</p>
                <p className="text-[10px] text-blue-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  TPO Office • Placement Cell
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gradient-to-b from-gray-50 to-white">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl">💬</span>
                    </div>
                    <p className="text-gray-500 text-xs font-medium">No messages yet</p>
                    <p className="text-gray-400 text-[10px] mt-1">Send a message to the TPO</p>
                  </div>
                </div>
              ) : (
                Object.keys(groupedMessages).map(function(date) {
                  return (
                    <div key={date}>
                      <div className="flex justify-center my-2">
                        <span className="px-2 py-0.5 bg-white shadow-sm rounded-full text-[9px] text-gray-500 font-medium">
                          {date}
                        </span>
                      </div>
                      {groupedMessages[date].map(function(msg: any, idx: number) {
                        var isMine = msg.senderId === currentUserId;
                        var prevSender = idx > 0 ? groupedMessages[date][idx-1].senderId : null;
                        var showAvatar = idx === 0 || groupedMessages[date][idx-1]?.senderId !== msg.senderId;
                        
                        return (
                          <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"} ${prevSender !== msg.senderId ? "mt-2" : "mt-0.5"}`}>
                            <div className={`max-w-[70%] ${!isMine && showAvatar ? "ml-0" : ""}`}>
                              {!isMine && showAvatar && (
                                <div className="flex items-center gap-1 mb-0.5 ml-1">
                                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[7px] font-bold">
                                    {(selectedUser?.name || "T").charAt(0)}
                                  </div>
                                  <span className="text-[9px] text-gray-500 font-medium">TPO Office</span>
                                </div>
                              )}
                              <div className={`relative px-3 py-1.5 text-xs leading-relaxed shadow-sm ${
                                isMine 
                                  ? "bg-blue-500 text-white rounded-lg rounded-br-sm" 
                                  : "bg-white text-gray-700 rounded-lg rounded-bl-sm border border-gray-100"
                              }`}>
                                {msg.text || msg.content}
                              </div>
                              <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMine ? "justify-end" : "justify-start"}`}>
                                <span className="text-[8px] text-gray-400">
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isMine && (
                                  <svg className="w-2.5 h-2.5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
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
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                    <div className="flex gap-1">
                      <span className="typing-dot text-blue-500 text-base" style={{animationDelay: '0s'}}>•</span>
                      <span className="typing-dot text-blue-500 text-base" style={{animationDelay: '0.2s'}}>•</span>
                      <span className="typing-dot text-blue-500 text-base" style={{animationDelay: '0.4s'}}>•</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-100 px-3 py-2 flex items-center gap-2 flex-shrink-0">
              <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 text-base transition-all">
                😊
              </button>
              <div className="flex-1 relative">
                <input 
                  value={newMessage} 
                  onChange={function(e: any){ setNewMessage(e.target.value); handleTyping(); }} 
                  onKeyDown={function(e: any){ if(e.key === "Enter") sendMessage(); }}
                  placeholder="Type a message to TPO..."
                  className="w-full px-3 py-1.5 rounded-full bg-gray-100 text-xs outline-none focus:ring-2 focus:ring-blue-400 transition-all placeholder:text-gray-400"
                />
              </div>
              {newMessage.trim() ? (
                <button 
                  onClick={sendMessage} 
                  className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              ) : (
                <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 text-base transition-all">
                  🎤
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}