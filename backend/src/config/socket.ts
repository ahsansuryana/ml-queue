import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "./env";

let io: Server;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const streamerId = socket.handshake.query.streamerId as string;
    if (streamerId) {
      socket.join(`streamer:${streamerId}`);
    }
    socket.on("disconnect", () => {});
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}
