import { Router, type Request, type Response } from "express";
import { prisma } from "../db/prisma.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { pollOptionId } = req.body;
  const voterId: string = "cmfjut5a10000sb7mxd89bqz1";

  try {
    const vote = await prisma.vote.create({
      data: {
        voterId,
        pollOptionId,
      },
    });

    return res.status(200).json({
      vote,
    });
  } catch (error) {
    console.log("Error while creating vote: ", error);
    return res.status(500).json({
      error: "Error while voting.",
    });
  }
});

router.get("/", async (req: Request, res: Response) => {
  const pollId: string = "cmfjx7rs50001sb878d8i9ggk";

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

export { router as voteRouter };
