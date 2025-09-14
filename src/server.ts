import { createServer } from "http";
import { app } from "./app.js";
import { setupSocket } from "./socket/socket.js";

const port = Number(process.env.PORT) || 3000;

const httpServer = createServer(app);

const io = setupSocket(httpServer);

app.set("io", io);

httpServer.listen(port, "0.0.0.0", () => {
  console.log("🚀 Server is running on port 3000");
});
