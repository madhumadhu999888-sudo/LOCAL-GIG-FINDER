import "dotenv/config";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import gigRoutes from "./routes/gigRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { setIo } from "./utils/socket.js";
import { registerChatHandlers } from "./sockets/chatSocket.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.join(__dirname, "../frontend/dist");
const serveFrontend =
  process.env.NODE_ENV === "production" || process.env.SERVE_FRONTEND === "true";

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: clientUrl,
    methods: ["GET", "POST"],
  },
});
setIo(io);
registerChatHandlers(io);

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, name: "LocalGigFinder API" });
});

app.use("/api/location", locationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);

if (serveFrontend) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
      return next();
    }
    res.sendFile(path.join(frontendDist, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5011;
const HOST = process.env.BIND_HOST || (serveFrontend ? "0.0.0.0" : "127.0.0.1");

const start = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("\n❌ MongoDB connection failed:", err.message);
    console.error(
      "→ Start MongoDB locally or set MONGO_URI in backend/.env (e.g. mongodb://127.0.0.1:27017/LocalGigFinder)\n"
    );
    process.exit(1);
  }

  server.listen(PORT, HOST, () => {
    console.log(`✅ LocalGigFinder API running at http://${HOST}:${PORT}`);
    console.log(`🔍 Health check:       http://${HOST}:${PORT}/api/health`);
    if (serveFrontend) {
      console.log(`🌐 Serving frontend from ${frontendDist}`);
    }
  });
};

start();
