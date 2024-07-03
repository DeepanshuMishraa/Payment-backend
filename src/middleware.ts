import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "./controllers/db";

interface AuthRequest extends Request {
  user?: {
    userId: number;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userid: number;
    };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userid },
      include: { account: true },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = { userId: user.id };
    next();
  } catch (error) {
    res.status(401).json({ error: "Token is not valid" });
  }
};
