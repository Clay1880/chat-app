import { useEffect } from 'react';
import { socket } from '../lib/socketClient';
import { useChatStore } from '../store/useChatStore';

export const useSocket = () => {
  const setOnlineUsers = useChatStore((state) => state.setOnlineUsers);
  const addMessage = useChatStore((state) => state.addMessage);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ Connected to socket server with ID:', socket.id);
    });

    socket.on('users_updated', (usersArray: [string, string][]) => {
      const formattedUsers = usersArray.map(([id, name]) => ({
        id,
        name,
        isGuest: true,
      }));
      
      setOnlineUsers(formattedUsers);
    });

    socket.on('receive_message', (message) => {
      addMessage(message);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from socket server');
    });

    return () => {
      socket.off('connect');
      socket.off('users_updated');
      socket.off('receive_message');
      socket.off('disconnect');
    };
  }, [setOnlineUsers, addMessage]);

  return { socket };
};