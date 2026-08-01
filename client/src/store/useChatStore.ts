import { create } from 'zustand';
import { User, Message } from '../types';

interface ChatState {
  currentUser: User | null;
  activeChat: string;
  messages: Message[];
  onlineUsers: User[];
  unreadChats: Record<string, number>;
  usernameError: string | null;
  offlineError: string | null;

  setCurrentUser: (user: User | null) => void;
  setActiveChat: (chatId: string) => void;
  addMessage: (message: Message) => void;
  setOnlineUsers: (users: User[]) => void;
  markUnread: (chatId: string) => void;
  clearUnread: (chatId: string) => void;
  setUsernameError: (error: string | null) => void;
  setOfflineError: (error: string | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  currentUser: null,
  activeChat: 'public',
  messages: [],
  onlineUsers: [],
  unreadChats: {},
  usernameError: null,
  offlineError: null,

  setCurrentUser: (user) => set({ currentUser: user }),
  setActiveChat: (chatId) =>
    set((state) => {
      const newUnread = { ...state.unreadChats };
      delete newUnread[chatId];
      return { activeChat: chatId, unreadChats: newUnread, offlineError: null };
    }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  markUnread: (chatId) =>
    set((state) => ({
      unreadChats: {
        ...state.unreadChats,
        [chatId]: (state.unreadChats[chatId] || 0) + 1,
      },
    })),
  clearUnread: (chatId) =>
    set((state) => {
      const newUnread = { ...state.unreadChats };
      delete newUnread[chatId];
      return { unreadChats: newUnread };
    }),
  setUsernameError: (error) => set({ usernameError: error }),
  setOfflineError: (error) => set({ offlineError: error }),
}));