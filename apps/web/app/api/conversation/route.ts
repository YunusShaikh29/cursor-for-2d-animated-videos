/* eslint-disable @typescript-eslint/no-unused-vars */
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "database";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    const conversation = await prisma.conversation.create({
      data: {
        userId: userId as string,
        title: "new animation",
      },
      include: {
        message: true,
      },
    });
    return NextResponse.json(conversation);
  } catch (e) {
    console.log("[CONVERSATION_POST]", e);
    return new NextResponse("Internal Server", { status: 500 });
  }
}

