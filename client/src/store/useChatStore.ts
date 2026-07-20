import { create } from 'zustand';
import { User, Message } from '../types';

interface ChatState {
  currentUser: User | null;
  activeChat: string; 
  messages: Message[];
  onlineUsers: User[];
  
  setCurrentUser: (user: User | null) => void;
  setActiveChat: (chatId: string) => void;
  addMessage: (message: Message) => void;
  setOnlineUsers: (users: User[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  currentUser: null,
  activeChat: 'public',
  messages: [],
  onlineUsers: [],
  
  setCurrentUser: (user) => set({ currentUser: user }),
  setActiveChat: (chatId) => set({ activeChat: chatId }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
}));