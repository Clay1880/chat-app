import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
});

interface UserSession {
  id: string; // socket.id or user assigned id
  name: string;
  gender: 'male' | 'female';
}

// Map socket.id -> UserSession
const activeUsers = new Map<string, UserSession>();

const broadcastUsers = () => {
  const usersList: [string, string, 'male' | 'female'][] = Array.from(activeUsers.entries()).map(([socketId, user]) => [
    socketId,
    user.name,
    user.gender || 'male',
  ]);
  io.emit('users_updated', usersList);
};

io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  socket.on('register_user', (userData: string | { id?: string; name: string; gender?: 'male' | 'female' }) => {
    const rawName = typeof userData === 'string' ? userData : userData.name;
    const gender: 'male' | 'female' = typeof userData === 'object' && userData.gender === 'female' ? 'female' : 'male';
    const userName = rawName ? rawName.trim() : '';

    if (!userName) {
      socket.emit('username_error', 'Username cannot be empty.');
      return;
    }

    // Check if username is already taken by another connected user
    const isDuplicate = Array.from(activeUsers.values()).some(
      (user) => user.name.toLowerCase() === userName.toLowerCase()
    );

    if (isDuplicate) {
      console.log(`⚠️ Duplicate username registration attempted: "${userName}"`);
      socket.emit('username_error', `Username "${userName}" is already taken. Please pick another.`);
      return;
    }

    const userId = typeof userData === 'object' && userData.id ? userData.id : socket.id;

    activeUsers.set(socket.id, {
      id: userId,
      name: userName,
      gender,
    });

    console.log(`👤 User registered: ${userName} (${gender}) (${socket.id})`);
    // Confirm successful registration to client
    socket.emit('registration_success', { name: userName, gender });
    broadcastUsers();
  });

  socket.on('send_message', (payload: { text: string; recipientId?: string }) => {
    const sender = activeUsers.get(socket.id);
    const senderName = sender ? sender.name : 'Anonymous';
    const senderGender = sender ? sender.gender : 'male';
    const recipientId = payload.recipientId || 'public';

    if (recipientId !== 'public') {
      const isRecipientOnline = activeUsers.has(recipientId);
      if (!isRecipientOnline) {
        console.log(`⚠️ Recipient offline for DM from ${senderName} to [${recipientId}]`);
        socket.emit('recipient_offline', {
          recipientId,
          text: `User is no longer online. Message could not be delivered.`,
        });
        return;
      }
    }

    const message = {
      id: crypto.randomUUID(),
      text: payload.text,
      senderId: socket.id,
      senderName,
      senderGender,
      recipientId,
      timestamp: Date.now(),
    };

    console.log(`💬 Message from ${senderName} to [${recipientId}]: "${payload.text}"`);

    if (recipientId === 'public') {
      io.emit('receive_message', message);
    } else {
      // Send to recipient
      io.to(recipientId).emit('receive_message', message);
      // Send back to sender so it appears in their direct chat view
      socket.emit('receive_message', message);
    }
  });

  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      console.log(`❌ User disconnected: ${user.name} (${socket.id})`);
      activeUsers.delete(socket.id);
      broadcastUsers();
    }
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO Server running on http://localhost:${PORT}`);
});
