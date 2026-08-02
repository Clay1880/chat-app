'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { socket } from '../../lib/socketClient';

export default function ChatContainer() {
  const [inputText, setInputText] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = useChatStore((state) => state.currentUser);
  const setCurrentUser = useChatStore((state) => state.setCurrentUser);
  const activeChat = useChatStore((state) => state.activeChat);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const messages = useChatStore((state) => state.messages);
  const onlineUsers = useChatStore((state) => state.onlineUsers);
  const unreadChats = useChatStore((state) => state.unreadChats);
  const clearUnread = useChatStore((state) => state.clearUnread);
  const offlineError = useChatStore((state) => state.offlineError);

  // Check if there are any unread messages across all users
  const totalUnreadCount = Object.values(unreadChats).reduce((a, b) => a + b, 0);

  // Auto scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  // Filter messages for current active chat
  const filteredMessages = messages.filter((msg) => {
    if (activeChat === 'public') {
      return msg.recipientId === 'public';
    }
    // Direct message between currentUser and recipient
    return (
      (msg.senderId === activeChat && (msg.recipientId === currentUser?.id || msg.recipientId === socket.id)) ||
      (msg.recipientId === activeChat && (msg.senderId === currentUser?.id || msg.senderId === socket.id))
    );
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    socket.emit('send_message', {
      text: inputText.trim(),
      recipientId: activeChat,
    });

    setInputText('');
  };

  const handleSelectUser = (userId: string) => {
    setActiveChat(userId);
    clearUnread(userId);
    setIsMobileSidebarOpen(false);
  };

  const handleSelectChannel = (channelId: string) => {
    setActiveChat(channelId);
    setIsMobileSidebarOpen(false);
  };

  const handleLogout = () => {
    socket.disconnect();
    setCurrentUser(null);
  };

  // Helper to format timestamps
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Active chat header title & online check
  const activeUserObj = onlineUsers.find((u) => u.id === activeChat);
  const isDirectMessage = activeChat !== 'public';
  const isRecipientOnline = !isDirectMessage || !!activeUserObj;
  const chatTitle = activeChat === 'public' ? '# General' : `@ ${activeUserObj?.name || 'Direct Message'}`;

  // Avatar helper with gender styling (Blue for male, Pink for female)
  const renderAvatar = (gender: 'male' | 'female' = 'male', isSmall: boolean = true) => {
    const dimensions = isSmall ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
    const bg =
      gender === 'female'
        ? 'bg-gradient-to-tr from-pink-600 to-rose-500 border-pink-400/40 text-white shadow-pink-500/20'
        : 'bg-gradient-to-tr from-blue-600 to-cyan-500 border-blue-400/40 text-white shadow-blue-500/20';
    const symbol = gender === 'female' ? '♀' : '♂';
    return (
      <div
        className={`${dimensions} rounded-full ${bg} border font-bold flex items-center justify-center shadow-sm shrink-0`}
      >
        {symbol}
      </div>
    );
  };

  // Render Sidebar Content (Shared between desktop sidebar & mobile drawer)
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* App Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-white leading-none">ChatX</span>
              <span className="text-[10px] text-indigo-400 font-medium leading-tight">Socket Network</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live
            </span>
            {/* Close Button on Mobile Drawer */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg md:hidden"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Channels */}
        <div className="p-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Channels
          </div>
          <button
            onClick={() => handleSelectChannel('public')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeChat === 'public'
                ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-slate-400 font-semibold">#</span>
              <span>General</span>
            </div>
            <span className="text-[11px] bg-slate-800/80 px-2 py-0.5 rounded-full text-slate-400 font-mono">
              Public
            </span>
          </button>
        </div>

        {/* Online Users */}
        <div className="p-3">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Online Users
            </span>
            <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded-full">
              {onlineUsers.length}
            </span>
          </div>
          <div className="space-y-1 max-h-[calc(100vh-340px)] overflow-y-auto pr-1">
            {onlineUsers.length === 0 ? (
              <p className="px-3 text-xs text-slate-500 italic">No users online</p>
            ) : (
              onlineUsers.map((user) => {
                const isSelf = user.id === socket.id || user.name === currentUser?.name;
                const isActive = activeChat === user.id;
                const unreadCount = unreadChats[user.id] || 0;
                const isFemale = user.gender === 'female';
                const nameColorClass = isFemale ? 'text-pink-400 font-bold' : 'text-blue-400 font-bold';

                return (
                  <button
                    key={user.id}
                    disabled={isSelf}
                    onClick={() => handleSelectUser(user.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                      isSelf
                        ? 'opacity-60 cursor-default text-slate-400'
                        : isActive
                        ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-600/30'
                        : unreadCount > 0
                        ? 'bg-slate-900 border border-indigo-500/40 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="relative">
                        {renderAvatar(user.gender, true)}
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950"></span>
                      </div>
                      <span className={`truncate ${isActive ? 'text-white font-bold' : nameColorClass}`}>
                        {user.name}
                      </span>
                    </div>

                    {/* Unread Indicator Badge / Dot */}
                    {unreadCount > 0 ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse ring-4 ring-rose-500/20"></span>
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          {unreadCount}
                        </span>
                      </span>
                    ) : (
                      isSelf && (
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">You</span>
                      )
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5 truncate">
          {renderAvatar(currentUser?.gender || 'male', false)}
          <div className="truncate">
            <p className={`text-xs font-bold leading-none truncate ${currentUser?.gender === 'female' ? 'text-pink-400' : 'text-blue-400'}`}>
              {currentUser?.name}
            </p>
            <p className="text-[11px] text-emerald-400 leading-tight mt-1 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{currentUser?.gender === 'female' ? '♀ Female Guest' : '♂ Male Guest'}</span>
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 font-sans relative">
      {/* Desktop Sidebar (visible on md screens and above) */}
      <aside className="hidden md:flex w-72 bg-slate-950 border-r border-slate-800 flex-col justify-between shrink-0">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer (Overlay for mobile screens < md) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          />
          {/* Slide Drawer */}
          <div className="relative z-10 w-4/5 max-w-xs bg-slate-950 h-full border-r border-slate-800 shadow-2xl">
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-slate-900 min-w-0">
        {/* Chat Top Header */}
        <header className="h-16 px-4 sm:px-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white md:hidden relative shrink-0"
              title="Open Navigation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {totalUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-pulse" />
              )}
            </button>

            {activeChat === 'public' ? (
              <span className="text-base sm:text-xl font-bold text-white truncate"># General</span>
            ) : (
              <div className="flex items-center gap-2 truncate">
                <span className="text-slate-400 font-bold text-base sm:text-xl">@</span>
                <span className={`text-base sm:text-xl font-bold truncate ${activeUserObj?.gender === 'female' ? 'text-pink-400' : 'text-blue-400'}`}>
                  {activeUserObj?.name || 'Direct Message'}
                </span>
                {activeUserObj?.gender && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${activeUserObj.gender === 'female' ? 'bg-pink-950/60 text-pink-300 border-pink-800/60' : 'bg-blue-950/60 text-blue-300 border-blue-800/60'}`}>
                    {activeUserObj.gender === 'female' ? '♀ Female' : '♂ Male'}
                  </span>
                )}
              </div>
            )}

            {activeChat === 'public' ? (
              <span className="hidden sm:inline-block text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full font-medium shrink-0">
                Public Channel
              </span>
            ) : !isRecipientOnline ? (
              <span className="text-[11px] sm:text-xs text-rose-400 bg-rose-950/80 border border-rose-800/60 px-2.5 py-0.5 rounded-full font-medium shrink-0">
                Offline
              </span>
            ) : null}
          </div>

          <div className="text-[11px] sm:text-xs text-slate-400 shrink-0 font-medium">
            {onlineUsers.length} online
          </div>
        </header>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
          {/* Offline Warning Banner for DM */}
          {isDirectMessage && (!isRecipientOnline || offlineError) && (
            <div className="p-3 sm:p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-rose-950/20">
              <div className="flex items-center gap-2.5">
                <span className="text-base sm:text-lg">⚠️</span>
                <div>
                  <div className="font-bold text-rose-200">No user online of that name</div>
                  <div className="text-[11px] text-rose-300/80 font-normal">
                    This user has disconnected. Messages cannot be delivered.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveChat('public')}
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-all shadow-sm text-center shrink-0"
              >
                Return to #General
              </button>
            </div>
          )}

          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 px-4 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-3 text-xl sm:text-2xl">
                💬
              </div>
              <p className="font-semibold text-slate-300 text-sm sm:text-base">No messages in this chat yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                {isDirectMessage && !isRecipientOnline
                  ? 'Target user is offline'
                  : `Send a message below to start the conversation in ${chatTitle}`}
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isSelf = msg.senderId === socket.id || msg.senderName === currentUser?.name;
              const senderObj = onlineUsers.find((u) => u.id === msg.senderId || u.name === msg.senderName);
              const senderGender = senderObj?.gender || msg.senderGender || (isSelf ? currentUser?.gender : 'male');
              const isFemaleSender = senderGender === 'female';
              const nameColor = isFemaleSender ? 'text-pink-400 font-bold' : 'text-blue-400 font-bold';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} max-w-full`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-bold">{isFemaleSender ? '♀' : '♂'}</span>
                    <span className={`text-xs ${nameColor}`}>{msg.senderName}</span>
                    <span className="text-[10px] text-slate-500">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div
                    className={`max-w-[85%] sm:max-w-xl px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed break-words ${
                      isSelf
                        ? 'bg-indigo-600 text-white rounded-tr-xs shadow-md shadow-indigo-600/20'
                        : 'bg-slate-800 text-slate-100 rounded-tl-xs border border-slate-700/60'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <div className="p-2.5 sm:p-4 border-t border-slate-800 bg-slate-950/70 shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3 max-w-5xl mx-auto items-center">
            <input
              type="text"
              disabled={isDirectMessage && !isRecipientOnline}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isDirectMessage && !isRecipientOnline
                  ? 'Cannot send message — User is offline'
                  : `Message ${chatTitle}...`
              }
              className="flex-1 bg-slate-800/90 border border-slate-700/80 text-white placeholder-slate-400 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-transparent transition-all text-xs sm:text-sm min-w-0 disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || (isDirectMessage && !isRecipientOnline)}
              className="bg-indigo-600 text-white px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-xl font-semibold hover:bg-indigo-500 active:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 shrink-0 text-xs sm:text-sm"
            >
              <span>Send</span>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9-7-9-7-9 7 9 7zm0 0v-7"
                />
              </svg>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
