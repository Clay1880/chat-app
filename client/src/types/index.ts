export interface User {
  id: string;
  name: string;
  gender: 'male' | 'female';
  avatar?: string;
  isGuest: boolean;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderGender?: 'male' | 'female';
  recipientId: string | 'public';
  timestamp: number;
}