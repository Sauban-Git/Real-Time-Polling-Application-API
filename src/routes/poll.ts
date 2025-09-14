import { Router, type Request, type Response } from "express";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  console.log("getting users");
  res.json({
    message: "getting poll",
  });
});

export { router as pollRouter };
