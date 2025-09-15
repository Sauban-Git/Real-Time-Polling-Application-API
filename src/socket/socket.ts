import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { prisma } from "../db/prisma.js";

export const setupSocket = (server: HttpServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
    },
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
