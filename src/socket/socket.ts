import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { JWT_SECRET } from "../config/constants.js";
import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";

export const setupSocket = (server: HttpServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket, next) => {
    const authorization = socket.handshake.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return next(new Error("Invalid token or no token provided"));
    }
    const token = authorization?.split(" ")[1] || "";
    try {
      jwt.verify(token, JWT_SECRET) as JwtPayload;
      next();
    } catch (error) {
      console.log("Error while jwt verify: ", error);
      return next(new Error("Invalid token.."));
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log(socket.id, " connected");

    socket.on("joinPoll", (pollId: string) => {
      socket.join(`poll-${pollId}`);
      console.log(`Socket-${socket.id} joined poll-${pollId}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(socket.id, " got disconnect for reason: ", reason);
    });
  });

  return io;
};
