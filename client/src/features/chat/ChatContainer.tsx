'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { socket } from '../../lib/socketClient';

export default function ChatContainer() {
  const [inputText, setInputText] = useState('');
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

  // Standard 'G' Avatar for everyone
  const renderAvatar = (isSmall: boolean = true) => {
    const dimensions = isSmall ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
    return (
      <div
        className={`${dimensions} rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border border-indigo-400/40 font-black flex items-center justify-center text-white shadow-sm shrink-0`}
      >
        G
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0">
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
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live
            </span>
          </div>

          {/* Channels */}
          <div className="p-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Channels
            </div>
            <button
              onClick={() => setActiveChat('public')}
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
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="relative">
                          {renderAvatar(true)}
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950"></span>
                        </div>
                        <span className="truncate font-medium">{user.name}</span>
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
            {renderAvatar(false)}
            <div className="truncate">
              <p className="text-xs font-bold text-white leading-none truncate">{currentUser?.name}</p>
              <p className="text-[11px] text-emerald-400 leading-tight mt-1 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Anonymous Guest
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
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-slate-900">
        {/* Chat Top Header */}
        <header className="h-16 px-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-white">{chatTitle}</span>
            {activeChat === 'public' ? (
              <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full font-medium">
                Public Discussion Channel
              </span>
            ) : !isRecipientOnline ? (
              <span className="text-xs text-rose-400 bg-rose-950/80 border border-rose-800/60 px-2.5 py-1 rounded-full font-medium">
                Offline
              </span>
            ) : null}
          </div>
          <div className="text-xs text-slate-400">
            {onlineUsers.length} user{onlineUsers.length === 1 ? '' : 's'} connected
          </div>
        </header>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Offline Warning Banner for DM */}
          {isDirectMessage && (!isRecipientOnline || offlineError) && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-between shadow-lg shadow-rose-950/20">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">⚠️</span>
                <div>
                  <div className="font-bold text-rose-200">No user online of that name</div>
                  <div className="text-[11px] text-rose-300/80 font-normal">
                    This user has disconnected or gone offline. Messages cannot be delivered.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveChat('public')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-all shadow-sm shrink-0"
              >
                Return to #General
              </button>
            </div>
          )}

          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-3 text-2xl">
                💬
              </div>
              <p className="font-semibold text-slate-300">No messages in this chat yet</p>
              <p className="text-xs text-slate-500 mt-1">
                {isDirectMessage && !isRecipientOnline
                  ? 'Target user is offline'
                  : `Send a message below to start the conversation in ${chatTitle}`}
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isSelf = msg.senderId === socket.id || msg.senderName === currentUser?.name;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} max-w-full`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-semibold text-slate-300">{msg.senderName}</span>
                    <span className="text-[10px] text-slate-500">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div
                    className={`max-w-xl px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
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
        <div className="p-4 border-t border-slate-800 bg-slate-950/70">
          <form onSubmit={handleSendMessage} className="flex gap-3 max-w-5xl mx-auto">
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
              className="flex-1 bg-slate-800/90 border border-slate-700/80 text-white placeholder-slate-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-transparent transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || (isDirectMessage && !isRecipientOnline)}
              className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-indigo-500 active:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-600/25 shrink-0 text-sm"
            >
              <span>Send</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
