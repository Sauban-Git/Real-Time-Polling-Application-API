import { Router, type Request, type Response } from "express";
import { prisma } from "../db/prisma.js";
import argon2 from "argon2";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  console.log("getting users");
  try {
    const users = await prisma.user.findMany({
      where: {},
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    return res.status(200).json({
      users,
    });
  } catch (error) {
    console.log("Error while fetching users: ", error);
  }
});

router.post("/", async (req: Request, res: Response) => {
  const {
    name,
    email,
    password,
  }: { name: string; email: string; password: string } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: "Please send valid input!" });

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      const passwordHash = await argon2.hash(password);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });

      return res.status(200).json({
        user,
        message: "Successful creating user!",
      });
    } else {
      return res.status(401).json({
        error: "Email already exist..",
      });
    }
  } catch (error) {
    console.log("Error while db call: ", error);
    return res.status(500).json({
      error: "Error while fetching data.",
    });
  }
});

export { router as userRouter };
