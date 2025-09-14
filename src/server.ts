import express from "express";
import http from "http";

const port = Number(process.env.PORT) | 3000;

const app = express();
app.use(express.json());

const server = http.createServer(app);

server.listen(port, () => {
  console.log("Listening on port: ", port);
});
