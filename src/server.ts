import { createServer } from "http";
import { app } from "./app.js";
import { setupSocket } from "./socket/socket.js";

const httpServer = createServer(app);

const io = setupSocket(httpServer);

app.set("io", io);

httpServer.listen(3000, () => {
  console.log("🚀 Server is running on port 3000");
});
