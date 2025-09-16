import { Router, type Request, type Response } from "express";
import { prisma } from "../db/prisma.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import type { AuthRequest } from "../types/types.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const polls = await prisma.poll.findMany({
      where: {
        isPublished: true,
      },
      select: {
        id: true,
        question: true,
        pollOptions: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      polls,
    });
  } catch (error) {
    console.log("Error while fetching polls: ", error);
    return res.status(500).json({
      error: "Error while fetching polls..",
    });
  }
});

router.post("/", authMiddleware, async (req: Request, res: Response) => {
  const { question, pollOptions }: { question: string; pollOptions: string[] } =
    req.body;
  const creatorId = (req as AuthRequest).payload?.userId;
  try {
    const poll = await prisma.poll.create({
      data: {
        question,
        isPublished: true,
        creatorId,
        pollOptions: {
          create: pollOptions.map((pollOption) => ({
            text: pollOption,
          })),
        },
      },
      include: {
        pollOptions: true,
      },
    });
    return res.status(200).json({
      poll,
    });
  } catch (error) {
    console.log("Error while creating polls", error);
    return res.status(500).json({
      error: "Error while creating poll.",
    });
  }
});

export { router as pollRouter };
