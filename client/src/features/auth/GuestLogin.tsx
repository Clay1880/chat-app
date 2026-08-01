'use client';

import { useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { socket } from '../../lib/socketClient';

export default function GuestLogin() {
  const [username, setUsername] = useState('');

  const setCurrentUser = useChatStore((state) => state.setCurrentUser);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) return;

    const newUser = {
      id: crypto.randomUUID(),
      name: username.trim(),
      isGuest: true,
    };

    setCurrentUser(newUser);

    socket.connect();

    socket.emit('register_user', newUser.name);
  };

  return (
    <div className="flex w-full h-full items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md p-8 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-600/30">
            CX
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">ChatX Network</h2>
            <p className="text-xs text-indigo-400 font-medium">Real-time socket messaging</p>
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-6">
          Enter a username to connect to the public channel and start chatting instantly.
        </p>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-500 py-3.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!username.trim()}
            className="w-full bg-indigo-600 text-white py-3.5 px-4 rounded-xl hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-semibold shadow-lg shadow-indigo-600/25 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            Enter Chatroom →
          </button>
        </form>
      </div>
    </div>
  );
}