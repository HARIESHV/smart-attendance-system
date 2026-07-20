"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToSession = exports.initSocket = void 0;
const initSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);
        // Join a session room (faculty/students join by sessionId)
        socket.on('join:session', (sessionId) => {
            socket.join(`session:${sessionId}`);
            console.log(`📡 Socket ${socket.id} joined session:${sessionId}`);
        });
        socket.on('leave:session', (sessionId) => {
            socket.leave(`session:${sessionId}`);
        });
        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });
};
exports.initSocket = initSocket;
// Emit to a specific session room
const emitToSession = (io, sessionId, event, data) => {
    io.to(`session:${sessionId}`).emit(event, data);
};
exports.emitToSession = emitToSession;
//# sourceMappingURL=socket.js.map