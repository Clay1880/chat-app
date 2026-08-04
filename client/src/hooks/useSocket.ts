import { useEffect } from 'react';
import { socket } from '../lib/socketClient';
import { useChatStore } from '../store/useChatStore';
import { playNotificationSound } from '../lib/sound';
import { Message } from '../types';

export const useSocket = () => {
  const setOnlineUsers = useChatStore((state) => state.setOnlineUsers);
  const addMessage = useChatStore((state) => state.addMessage);
  const markUnread = useChatStore((state) => state.markUnread);
  const setUsernameError = useChatStore((state) => state.setUsernameError);
  const setCurrentUser = useChatStore((state) => state.setCurrentUser);
  const setOfflineError = useChatStore((state) => state.setOfflineError);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ Connected to socket server with ID:', socket.id);
    });

    socket.on('username_error', (errorMsg: string) => {
      console.warn('⚠️ Username error:', errorMsg);
      setUsernameError(errorMsg);
      setCurrentUser(null);
      socket.disconnect();
    });

    socket.on('registration_success', () => {
      setUsernameError(null);
    });

    socket.on('recipient_offline', (payload: { recipientId: string; text: string }) => {
      setOfflineError(payload.text);
    });

    socket.on('users_updated', (usersArray: [string, string, ('male' | 'female')?][]) => {
      const formattedUsers = usersArray.map(([id, name, gender]) => ({
        id,
        name,
        gender: gender || 'male',
        isGuest: true,
      }));

      setOnlineUsers(formattedUsers);
    });

    socket.on('receive_message', (message: Message) => {
      addMessage(message);

      // Check if message is a private message sent to current user by someoneelse
      const isPrivateMessage = message.recipientId !== 'public' && message.senderId !== socket.id;

      if (isPrivateMessage) {
        // Play notification sound
        playNotificationSound();

        // Check if user is NOT currently in that chat 
        const currentActiveChat = useChatStore.getState().activeChat;
        if (currentActiveChat !== message.senderId) {
          markUnread(message.senderId);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from socket server');
    });

    return () => {
      socket.off('connect');
      socket.off('username_error');
      socket.off('registration_success');
      socket.off('recipient_offline');
      socket.off('users_updated');
      socket.off('receive_message');
      socket.off('disconnect');
    };
  }, [setOnlineUsers, addMessage, markUnread, setUsernameError, setCurrentUser, setOfflineError]);

  return { socket };
};