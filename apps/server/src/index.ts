import express from "express";
import { prisma } from "database/index";
import { Jwt } from "jsonwebtoken";
import cors from "cors";
import { serverAuthMiddleware } from "../dist/serverAuthMiddleware.js";
import { rateLimitingMiddleware } from "../dist/rateLimitingMiddleware.js";
import { Queue } from "bullmq";


const queue = new Queue('animation-job-queue', {
    connection: {
        host: 'localhost',
        port: 6379
    }
})

const app = express();
app.use(express.json());
app.use(cors());

app.get("/healthy-server", async (req, res) => {
  res.send("healthy server");
});

app.post(
  "/api/job",
  serverAuthMiddleware,
  rateLimitingMiddleware,
  async (req, res) => {
    const { userId, conversationId, prompt } = req.body;

    if (!userId || !conversationId || !prompt) {
      console.log(
        "Job creation handler: missing parameters in the request body"
      );
      res.status(400).json({
        error: "Missing required parameters",
      });
    }

    try {
      const transactionResult = await prisma.$transaction(async (tx: any) => {
        const userForTransaction = await tx.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            dailyAnimationCount: true,
            lastAnimationDate: true,
          },
        });

        if (!userForTransaction) {
          throw new Error(
            "User not found in transation: index.js | transactionResult"
          ); // shouldn't happen
        }

        const today = new Date();
        today.setHours(0, 0, 0);

        let countInTransaction = userForTransaction.dailyAnimationCount;
        let lastDateInTransaction = userForTransaction.lastAnimationDate;

        if (
          !lastDateInTransaction ||
          lastDateInTransaction.getTime() < today.getTime()
        ) {
          countInTransaction = 0;
          lastDateInTransaction = today;
        }

        const MAX_DAILY_ANIMATIONS = 50;

        if (countInTransaction >= MAX_DAILY_ANIMATIONS) {
          throw new Error(`Rate limit exceeded (${MAX_DAILY_ANIMATIONS}/day).`);
        }

        await tx.user.update({
          where: {
            id: userId,
          },
          data: {
            dailyAnimationCount: countInTransaction + 1,
            lastAnimationDate: lastDateInTransaction,
          },
        });

        const newMesage = await tx.message.create({
          data: {
            conversationId,
            role: "user",
            content: prompt,
          },
        });

        const newJob = await tx.job.create({
          data: {
            messageId: newMesage.id,
            status: "pending",
          },
        });

        return { message: newMesage, job: newJob };
      });


      const queueRes = await queue.add('animation', {jobId: transactionResult.job.id, userId, conversationId, prompt })
      console.log(queueRes.data )

      res.status(201).json({
        message: transactionResult.message,
        job: transactionResult.job,
        status: transactionResult.job.status,
      });



    } catch (error: any) {
      console.error("Job Creation Transaction Failed:", error);

      if (error.message.includes("Rate limit exceeded")) {
        res.status(429).json({ error: error.message });
      }

      res.status(500).json({ error: "Failed to create job." });
    }
  }
);

app.listen(8080, () => {
  console.log("server listening on port 8080");
});
