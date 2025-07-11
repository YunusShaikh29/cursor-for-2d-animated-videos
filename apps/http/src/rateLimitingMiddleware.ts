import { Request, Response, NextFunction } from "express";
import { prisma } from "database";

const MAX_DAILY_ANIMATIONS = 50;

export async function rateLimitingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.body.userId as string | undefined;

  if (!userId) {
    res.status(400).json({ error: "UserId missing in request" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        dailyAnimationCount: true,
        lastAnimationDate: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found." });
    }

    const today = new Date();
    today.setHours(0, 0, 0);

    let currentCount = user?.dailyAnimationCount;
    const lastDate = user?.lastAnimationDate;

    const isNewDay = !lastDate || lastDate.getTime() < today.getTime();

    if (isNewDay) {
      currentCount = 0;
    }

    if(currentCount === undefined){
        throw new Error("current cound undefined")
    }

    if (currentCount >= MAX_DAILY_ANIMATIONS) {
      res
        .status(429)
        .json({ error: `Rate limit exceeded (${MAX_DAILY_ANIMATIONS}/day).` });
    }

    next();
  } catch (e) {
    console.error(
      "Rate Limit Middleware Error fetching user or processing logic:",
      e
    );
    res
      .status(500)
      .json({ error: "Internal server error during rate limit check." });
  }
}
