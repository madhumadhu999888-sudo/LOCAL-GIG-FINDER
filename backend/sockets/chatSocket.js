import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const registerChatHandlers = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("name role");
      if (!user) return next(new Error("Authentication error"));
      socket.userId = String(user._id);
      socket.user = user;
      next();
    } catch {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on("join:application", (applicationId) => {
      if (!applicationId) return;
      socket.join(`app:${applicationId}`);
    });

    socket.on("disconnect", () => {});
  });
};
