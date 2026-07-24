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
    <div className="flex w-full h-full items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-3xl font-bold mb-2 text-slate-900">Welcome to ChatX</h2>
        <p className="text-slate-500 mb-8">Enter a guest username to join the room.</p>
        
        <form onSubmit={handleJoin} className="space-y-4">
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. Alex" 
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            autoFocus
          />
          <button 
            type="submit"
            disabled={!username.trim()}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join as Guest
          </button>
        </form>
      </div>
    </div>
  );
}