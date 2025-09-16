import { Router, type Request, type Response } from "express";
import { prisma } from "../db/prisma.js";
import { Server as SocketIOServer } from "socket.io";
import type { AuthRequest } from "../types/types.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, async (req: Request, res: Response) => {
  const { pollOptionId }: { pollOptionId: string } = req.body;

  const voterId = (req as AuthRequest).payload.userId;

  try {
    const vote = await prisma.vote.create({
      data: {
        voterId,
        pollOptionId,
      },
    });

    const io = req.app.get("io") as SocketIOServer;

    const updatedResult = await getUpdatedResult(pollOptionId);
    io.to(`poll-${updatedResult?.id}`).emit("vote:new", updatedResult);

    return res.status(200).json({
      vote,
    });
  } catch (error) {
    console.log("Error while creating vote: ", error);
    return res.status(500).json({
      error: "Error while voting. Recheck Option choosen",
    });
  }
});

router.get("/:pollId", async (req: Request, res: Response) => {
  const pollId: string = req.params.pollId || "";

  try {
    const pollWithVoteCounts = await prisma.poll.findUnique({
      where: {
        id: pollId,
      },
      include: {
        pollOptions: {
          select: {
            id: true,
            text: true,
            votes: {
              select: {
                id: true,
              },
            },
            _count: {
              select: {
                votes: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json(pollWithVoteCounts);
  } catch (error) {
    console.log("Error fetching votes: ", error);
    return res.status(500).json({
      error: "Error fetching voting counts.",
    });
  }
});

const getUpdatedResult = async (pollOptionsId: string) => {
  try {
    const result = await prisma.pollOption.findUnique({
      where: {
        id: pollOptionsId,
      },
      select: {
        poll: {
          include: {
            pollOptions: {
              select: {
                id: true,
                text: true,
                votes: {
                  select: {
                    id: true,
                  },
                },
                _count: {
                  select: {
                    votes: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return result?.poll;
  } catch (error) {
    console.log("Error while fetching pollOptions result: ", error);
  }
};

export { router as voteRouter };
