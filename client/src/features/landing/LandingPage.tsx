'use client';

import { useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { socket } from '../../lib/socketClient';

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const setCurrentUser = useChatStore((state) => state.setCurrentUser);
  const usernameError = useChatStore((state) => state.usernameError);
  const setUsernameError = useChatStore((state) => state.setUsernameError);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;

    setUsernameError(null);
    setIsJoining(true);

    const newUser = {
      id: crypto.randomUUID(),
      name: trimmed,
      isGuest: true,
    };

    setCurrentUser(newUser);
    socket.connect();
    socket.emit('register_user', newUser.name);

    setTimeout(() => {
      setIsJoining(false);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (usernameError) setUsernameError(null);
    setUsername(e.target.value);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden relative selection:bg-indigo-500 selection:text-white">
      {/* Background Light Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Top Navbar */}
      <nav className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/25">
            G
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">ChatX</span>
        </div>

        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          100% Anonymous & Private
        </span>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-6 py-4 flex-1 flex flex-col items-center justify-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium mb-6 shadow-sm">
          <span>🛡️ No Email Required</span>
          <span className="text-slate-600">•</span>
          <span>Zero Data Collection</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight mb-4">
          Chat Freely. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Zero Tracking.
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-md mb-8 leading-relaxed">
          Instant real-time socket messaging. Enter a unique guest username to jump straight into the chat.
        </p>

        {/* Auth Card */}
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl text-left">

          {/* Username Error Banner */}
          {usernameError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2.5 animate-shake">
              <span className="text-base">⚠️</span>
              <span>{usernameError}</span>
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Guest Username
              </label>
              <input
                type="text"
                value={username}
                onChange={handleInputChange}
                placeholder="e.g. Alex"
                className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-500 py-3.5 px-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!username.trim() || isJoining}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-40 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
            >
              <span>{isJoining ? 'Connecting...' : 'Join Chatroom'}</span>
              <span>→</span>
            </button>
          </form>
        </div>

        {/* USP Pills */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400">⚡</span>
            <span>Sub-10ms Latency</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">🔒</span>
            <span>1-on-1 Direct Messaging</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400">💬</span>
            <span>Public General Channel</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-[11px] text-slate-600">
        ChatX • Privacy-First Real-Time Messaging
      </footer>
    </div>
  );
}
