'use client';

import { useChatStore } from '../src/store/useChatStore';
import LandingPage from '../src/features/landing/LandingPage';
import ChatContainer from '../src/features/chat/ChatContainer';
import { useSocket } from '../src/hooks/useSocket';

export default function Home() {
  const currentUser = useChatStore((state) => state.currentUser);
  useSocket();

  return (
    <main className="h-screen w-screen overflow-x-hidden bg-slate-950 font-sans text-slate-100 antialiased">
      {!currentUser ? <LandingPage /> : <ChatContainer />}
    </main>
  );
}