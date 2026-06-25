import Notification from "../models/Notification.js";
import { getIo } from "./socket.js";

export const notifyUser = async (userId, { title, message, meta }) => {
  const notification = await Notification.create({
    user: userId,
    title,
    message,
    meta,
  });

  const io = getIo();
  if (io) {
    const payload = notification.toObject ? notification.toObject() : notification;
    io.to(`user:${userId}`).emit("notification:new", payload);
  }

  return notification;
};
