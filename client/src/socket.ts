import { io, Socket } from 'socket.io-client';

// Single socket instance shared across the app.
// Vite proxies /socket.io to the Express server in dev.
export const socket: Socket = io({
  autoConnect: false,
});
