import { Server } from 'socket.io';
export declare const initSocket: (io: Server) => void;
export declare const emitToSession: (io: Server, sessionId: string, event: string, data: unknown) => void;
//# sourceMappingURL=socket.d.ts.map