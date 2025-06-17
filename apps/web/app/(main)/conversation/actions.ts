/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable turbo/no-undeclared-env-vars */
"use server";

import { auth } from "@/auth";
import axios from "axios";

export async function createJobAndMessage(
  conversationId: string,
  prompt: string
) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    console.error("Server action: Unauthorized access attempted.");
    throw new Error("Unauthorized, Please sign in.");
  }

  const userId = session.user.id;

  const expressUrl = process.env.NEXT_PUBLIC_EXPRESS_URL;
  if (!expressUrl) {
    console.error("Server Action Error: url is missing in env");
  }

  try {
    const response = await axios.post(
      `${expressUrl}/api/job`,
      { conversationId, prompt, userId },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Server-Auth": process.env.SERVER_SECRET,
        },
        timeout: 1000,
      }
    );

    if (response.status === 401 || response.status === 403) {
      console.error("Server Action Error: Backend authentication failed");
      throw new Error("Server authentication failed.");
    }

    if (response.status === 429) {
      const errorBody = response.data;
      console.warn(
        "Server Action Warning: Express backend rate limit exceeded."
      );
      throw new Error(errorBody?.error || "Rate limit exceeded.");
    }
    if (response.status !== 200 && response.status !== 201) {
      const errorBody = response.data;
      console.error(
        "Server Action Error: Express backend returned unexpected status:",
        response.status,
        errorBody
      );
      throw new Error(
        `Express backend failed: ${response.status} ${response.statusText}`
      );
    }

    const data = response.data;
    return data;
  } catch (e: any) {
    console.error("Server aciton catch block error:", e.message);
  }
}
