import { verifyToken } from "@clerk/backend";
import type { NextFunction, Request, Response } from "express";

export type AuthContext = {
  userId: string;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authorization = req.header("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : null;
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!token || !secretKey) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const payload = await verifyToken(token, { secretKey });
    if (!payload.sub) {
      res.status(401).json({ error: "Invalid authentication token" });
      return;
    }

    req.auth = { userId: payload.sub };
    next();
  } catch (error) {
    req.log.warn({ err: error }, "Rejected Clerk token");
    res.status(401).json({ error: "Invalid authentication token" });
  }
}