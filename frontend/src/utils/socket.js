import { io } from "socket.io-client";
import { getToken } from "./api.js";

let socket;

const socketUrl = import.meta.env.VITE_API_URL || undefined;

export function getSocket() {
  if (socket?.connected) return socket;
  const token = getToken();
  if (!token) return null;
  socket = io(socketUrl, {
    path: "/socket.io",
    auth: { token },
    transports: ["websocket", "polling"],
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
