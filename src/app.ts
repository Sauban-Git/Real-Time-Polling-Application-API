import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import { userRouter } from "./routes/user.js";
import { voteRouter } from "./routes/vote.js";
import { pollRouter } from "./routes/poll.js";

dotenv.config();

export const app = express();

app.use(express.json());

app.use("/user", userRouter);
app.use("/poll", pollRouter);
app.use("/vote", voteRouter);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Yup! successful connection",
  });
});
