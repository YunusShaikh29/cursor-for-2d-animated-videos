import { NextFunction, Request, Response } from "express";
import {config} from "dotenv"

export const serverAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    config()
  const serverAuthSecret = req.headers["x-server-auth"];
  console.log(serverAuthSecret);
  console.log(process.env.SERVER_SECRET);

  if (serverAuthSecret && serverAuthSecret === process.env.SERVER_SECRET) {
    next();
  }

  res.status(403);
};
