import { NextFunction, Request, Response } from "express";
import {config} from "dotenv"

export const serverAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    config()
  const serverAuthSecret = req.headers["x-server-auth"];

  if (serverAuthSecret && serverAuthSecret === process.env.SERVER_SECRET) {
    next();
  }

  res.status(403);
};
