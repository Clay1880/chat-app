'use client';

import { useChatStore } from '../src/store/useChatStore';
import GuestLogin from '../src/features/auth/GuestLogin';
import { useSocket } from '../src/hooks/useSocket';

export default function Home() {
  const currentUser = useChatStore((state) => state.currentUser);
  useSocket();

  return (
    <main className="h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900 antialiased">
      {!currentUser ? (
        <GuestLogin />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-4">
           <h1 className="text-3xl font-bold">Welcome to the network, {currentUser.name}!</h1>
           <p className="text-slate-500">The chat interface is under construction...</p>
        </div>
      )}
    </main>
  );
}