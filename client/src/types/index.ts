export interface User {
  id: string;
  name: string;
  isGuest: boolean;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  recipientId: string | 'public';
  timestamp: number;
}