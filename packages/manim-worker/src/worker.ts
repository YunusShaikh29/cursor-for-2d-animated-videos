import { Worker } from "bullmq";
import { prisma } from "database/index";
import { config } from "dotenv";
import OpenAI from "openai";
import * as fs from "node:fs/promises";
import * as path from "node:path"; // Needed for path joining
import * as os from "node:os";
import { execa } from "execa";
import { exec } from "node:child_process";
import { PathLike } from "fs";

config();

interface parsedData {
  jobId: string;
  userId: string;
  conversationId: string;
  prompt: string;
}

interface DockerResult {
  stdout: string;
  stderr: string;
  exitCode: number;
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
    const BYPASS_LLM = process.env.BYPASS_LLM_CALL === "true";
    const modelToUse = "gpt-4o-mini";

    console.log(
      `Worker: Calling OpenAI API (${modelToUse}) for job ${jobId}...`
    );

    if (BYPASS_LLM) {
      manimScript = `
            
from manim import *

class ClientServerModel(Scene):
    def construct(self):
        client_box = Rectangle(width=2.5, height=1, color=BLUE).shift(LEFT * 4)
        client_text = Text("Client", font_size=32).move_to(client_box.get_center())
        server_box = Rectangle(width=2.5, height=1, color=GREEN).shift(ORIGIN)
        server_text = Text("Server", font_size=32).move_to(server_box.get_center())
        db_box = Rectangle(width=2.5, height=1, color=YELLOW).shift(RIGHT * 4)
        db_text = Text("Database", font_size=32).move_to(db_box.get_center())

        self.play(
            FadeIn(client_box), FadeIn(client_text),
            FadeIn(server_box), FadeIn(server_text),
            FadeIn(db_box), FadeIn(db_text),
            run_time=1.5
        )

        # Arrow: Request from Client to Server
        req_arrow1 = Arrow(
            client_box.get_right(), server_box.get_left(),
            buff=0.1, color=WHITE
        )
        req_label1 = Text("request", font_size=28).next_to(req_arrow1, UP)
        self.play(GrowArrow(req_arrow1), FadeIn(req_label1), run_time=1.2)
        self.wait(0.6)

        # Arrow: Request from Server to Database
        req_arrow2 = Arrow(
            server_box.get_right(), db_box.get_left(),      buff=0.1, color=WHITE
        )
        req_label2 = Text("request", font_size=28).next_to(req_arrow2, UP)
        self.play(
            FadeOut(req_arrow1), FadeOut(req_label1),
            GrowArrow(req_arrow2), FadeIn(req_label2),
            run_time=1.2
        )
        self.wait(0.6)

        # Remove request arrow to DB
        self.play(FadeOut(req_arrow2), FadeOut(req_label2), run_time=0.6)
        self.wait(0.3)

        # Arrow: Data from DB to Server
        data_arrow = Arrow(
            db_box.get_left(), server_box.get_right(),
            buff=0.1, color=ORANGE
        )
        data_label = Text("data", font_size=28).next_to(data_arrow, UP)
        self.play(GrowArrow(data_arrow), FadeIn(data_label), run_time=1.2)
        self.wait(0.6)

        `;
    } else {
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
          temperature: 0.5,
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
        await prisma.job.update({
          where: { id: jobId },
          data: { status: "failed", error: llmError as string },
        });
        throw llmError; // Re-throw the specific error for BullMQ
      }
    }

    await prisma.job.update({
      where: {
        id: jobId,
      },
      data: {
        script: manimScript,
      },
    });

    let tempDir: PathLike | null = null;
    let outputFilePath = null;

    try {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "manim-job-"));

      const scriptFileName = `animation_script_${jobId}.py`;
      const outputFileName = `output_${jobId}.mp4`;
      const scriptFilePath = path.join(tempDir, scriptFileName);
      outputFilePath = path.join(tempDir, outputFileName);

      await fs.writeFile(scriptFilePath, manimScript);

      let sceneClassName = "SceneFromPrompt"; //default
      const sceneNameRegex = /class (\w+)\(Scene\):?/;
      const sceneMatch = manimScript.match(sceneNameRegex);

      if (sceneMatch && sceneMatch[1]) {
        sceneClassName = sceneMatch[1];
        console.log(`Worker: Extracted Scene class name: ${sceneClassName}`);
      } else {
        console.warn(
          `Worker Warning: Could not extract standard Scene class name from script for job ${jobId}. Assuming default: ${sceneClassName}`
        );
        // Decide if this is a fatal error or just a warning depending on expected LLM output reliability
        // If fatal: throw new Error('Could not find main Scene class in generated script.');
      }
      await new Promise<void>((resolve, reject) => {
        const windowsPermsCmd = `icacls "${tempDir}" /grant Everyone:(F) /T`; // Grant full control to Everyone recursively
        console.log(
          `Worker: Attempting to set permissions: ${windowsPermsCmd}`
        );
        exec(windowsPermsCmd, (error, stdout, stderr) => {
          if (error) {
            console.error("Worker Error: Failed to set permissions:", error);
            // Decide if this failure should stop the job
            // reject(error); // Reject to stop the job
            resolve(); // Resolve to continue despite permission command failure
          } else {
            console.log(
              "Worker: Permissions set successfully (or command finished)."
            );
            resolve();
          }
        });
      });

      const dockerImage = "manimcommunity/manim:latest";

      const manimCommandInsideDocker = [
        "python",
        "-m",
        "manim",
        "/scripts/" + scriptFileName,
        sceneClassName,
        "--format",
        "mp4",
        "--output_file",
        "/scripts/" + outputFileName,
        "-ql",
      ];

      const dockerArgs = [
        "run",
        "--rm",
        "-v",
        `${tempDir}:/scripts`,
        dockerImage,
        ...manimCommandInsideDocker,
      ];

      const dockerCommand = ["docker", ...dockerArgs].join(" ");
      console.log(`Worker: Running docker command: ${dockerCommand}`);

      const dockerResult = await new Promise<DockerResult>(
        (resolve, reject) => {
          exec(dockerCommand, (error, stdout, stderr) => {
            if (error) {
              console.error(`Worker: Docker execution error: ${error.message}`);
              reject(error);
              return;
            }
            resolve({ stdout, stderr, exitCode: error ? error : 0 });
          });
        }
      );

      console.log(
        `Worker: Docker command finished for job ${jobId}. Exit code: ${dockerResult.exitCode}`
      );
      if (dockerResult.stdout) {
        console.log("Worker: Docker stdout:", dockerResult.stdout);
      }
      if (dockerResult.stderr) {
        console.warn("Worker: Docker stderr:", dockerResult.stderr);
      }

      const outputExists = await fs
        .stat(outputFilePath)
        .then(() => true)
        .catch(() => false);
      if (dockerResult.exitCode !== 0 || !outputExists) {
        const errorMsg = `Docker Manim failed. Exit code: ${dockerResult.exitCode}. Output file found: ${outputExists}. Stderr: ${dockerResult.stderr || "N/A"}`;
        console.error(`Worker Error: ${errorMsg}`);
        // Update job status to failed due to Docker error
        await prisma.job.update({
          where: { id: jobId },
          data: { status: "failed", error: `Manim render failed: ${errorMsg}` },
        });
        throw new Error(errorMsg); // Re-throw
      }
    } catch (dockerRunError: any) {
      console.error(
        `Worker Error: Failed during Docker run phase for job ${jobId}.`,
        dockerRunError
      );
      const errorMsg = `Failed to run Manim render: ${dockerRunError.message || "Unknown error"}`;
      await prisma.job.update({
        where: { id: jobId },
        data: { status: "failed", error: errorMsg },
      });
      throw dockerRunError; // Re-throw
    } 
    // finally {
    //   if (tempDir) {
    //     console.log(`Worker: Cleaning up temporary directory ${tempDir}`);
    //     await fs
    //       .rm(tempDir, { recursive: true, force: true })
    //       .catch((err) => console.error("Worker Cleanup Error:", err));
    //   }
    // }

    let permanentOutputPath = null;

    if (
      outputFilePath &&
      (await fs
        .stat(outputFilePath)
        .then(() => true)
        .catch(() => false))
    ) {
      try {
        console.log(`Worker: Starting video copy phase for job id ${jobId}`);
        const localOutputDir = path.join(__dirname, "local_output"); // Example path relative to worker's entry file
        const permanentOutputFileName = `animation_${jobId}.mp4`;
        permanentOutputPath = path.join(
          localOutputDir,
          permanentOutputFileName
        );

        console.log(
          `Worker: Copying output video from ${outputFilePath} to ${permanentOutputPath}`
        );
        // Ensure the local output directory exists
        await fs.mkdir(localOutputDir, { recursive: true });
        // Copy the file
        await fs.copyFile(outputFilePath, permanentOutputPath);
        console.log(`Worker: Video copied successfully.`);
      } catch (copyError: any) {
        console.error(
          `Worker Error: Failed to copy output video for job ${jobId}.`,
          copyError
        );
        const errorMsg = `Failed to save video file: ${copyError.message}`;
        await prisma.job.update({
          where: { id: jobId },
          data: { status: "failed", error: errorMsg },
        });
        throw new Error(errorMsg);
      }
    }

    if (tempDir) {
      console.log(`Worker: Cleaning up temporary directory ${tempDir}`);
      await fs
        .rm(tempDir, { recursive: true, force: true })
        .catch((err) => console.error("Worker Cleanup Error:", err));
    }

    console.log(`Worker: Updating job ${jobId} status to complete.`);
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "complete", // Use your STATUS enum value
        videoUrl: permanentOutputPath, // Save the local path
      },
    });
  },

  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);
