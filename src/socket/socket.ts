import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

export const setupSocket = (server: HttpServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(socket.id, " got connected");

    socket.on("disconnect", (listener) => {
      console.log(socket.id, " got disconnect: ", listener);
    });
  });
};
