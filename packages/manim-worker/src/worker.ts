import { Worker } from "bullmq";
import { prisma } from "database/index";
import { config } from "dotenv";
import OpenAI from "openai";
import * as fs from "node:fs/promises"

config();

interface parsedData {
  jobId: string;
  userId: string;
  conversationId: string;
  prompt: string;
}

const openaiAPIKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: openaiAPIKey,
});

const worker = new Worker(
  "animation-job-queue",
  async (job) => {
    const parsedData: parsedData = job.data;
    console.log(parsedData);

    const { jobId, conversationId, userId, prompt } = parsedData;

    const jobDetails = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      include: {
        message: true,
      },
    });

    if (!jobDetails || !jobDetails.message) {
      console.log(
        `Worker Error: Job ${jobId} or its associated messages not found in DB`
      );
      throw new Error(`Job ${jobId} or message not found.`);
    }

    console.log(`Worker: Updating the job ${jobId} status to processing.`);

    await prisma.job.update({
      where: {
        id: jobId,
      },
      data: {
        status: "processing",
      },
    });

    let manimScript = null;
    const modelToUse = "gpt-4o-mini";

    console.log(
      `Worker: Calling OpenAI API (${modelToUse}) for job ${jobId}...`
    );

    if (!openai.apiKey) {
      const errorMsg =
        "OpenAI API key was not set during worker initialization.";
      console.error("Worker Error:", errorMsg);
      await prisma.job.update({
        where: { id: jobId },
        data: { status: "failed", error: errorMsg },
      });
      throw new Error(errorMsg);
    }

    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that generates Manim Python code for 2D animations. Provide only the Python code within a single Markdown code block, starting with ```python and ending with ```. Include necessary imports like 'from manim import *'. Define a single Scene class with a `construct` method. Do not include any explanatory text, comments, or usage examples outside the code block.",
          },
          {
            role: "user",
            content: `Generate Manim code for the following animation idea: ${prompt}`,
          },
        ],
        model: modelToUse,
        temperature: 0.7,
        max_completion_tokens: 1500,
      });

      const generatedContent = completion.choices[0]?.message.content;

      if (!generatedContent || generatedContent.trim() === "") {
        console.error(
          `Worker Error: OpenAI returned empty content for job ${jobId}.`
        );
        await prisma.job.update({
          where: { id: jobId },
          data: { status: "failed", error: "LLM returned empty content." },
        });
        throw new Error("LLM returned empty content.");
      }

      const codeBlockRegex = /```python\s*([\s\S]*?)\s*```/; //regex to find our python code from the generated content.
      const match = generatedContent.match(codeBlockRegex);

      if (match && match[1]) {
        manimScript = match[1].trim();
      } else {
        console.error(
          `Worker Error: LLM response did not contain a valid Python code block for job ${jobId}.`,
          { generatedContent }
        );
        await prisma.job.update({
          where: { id: jobId },
          data: {
            status: "failed",
            error: "LLM did not generate valid Manim code.",
          },
        });
        throw new Error("LLM did not generate valid Manim code.");
      }

      console.log(generatedContent);
    } catch (llmError) {
      console.error(
        `Worker Error: OpenAI API call failed for job ${jobId}.`,
        llmError
      );
    }

    await prisma.job.update({
      where: {
        id: jobId,
      },
      data: {
        script: manimScript,
      },
    });

    // const writingFileRes = await fs.writeFile()
    

  },

  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);
