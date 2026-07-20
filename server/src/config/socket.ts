import { Server, Socket } from 'socket.io';

export const initSocket = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join a session room (faculty/students join by sessionId)
    socket.on('join:session', (sessionId: string) => {
      socket.join(`session:${sessionId}`);
      console.log(`📡 Socket ${socket.id} joined session:${sessionId}`);
    });

    socket.on('leave:session', (sessionId: string) => {
      socket.leave(`session:${sessionId}`);
    });

    // Global Faculty room for receiving notifications
    socket.on('join:faculty', () => {
      socket.join('faculty');
      console.log(`📡 Socket ${socket.id} joined global faculty room`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};

// Emit to a specific session room
export const emitToSession = (io: Server, sessionId: string, event: string, data: unknown): void => {
  io.to(`session:${sessionId}`).emit(event, data);
};
