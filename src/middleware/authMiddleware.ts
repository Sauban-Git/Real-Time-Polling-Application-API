import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config/constants.js";
import type { AuthRequest } from "../types/types.js";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided." });
  }

  const token = authorization?.split(" ")[1] || "";
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as AuthRequest).payload = decoded;
    next();
  } catch (error) {
    console.log("Error while jwt verify: ", error);
    return res.status(400).json({
      error: "Invalid token or no token provided.",
    });
  }
};
