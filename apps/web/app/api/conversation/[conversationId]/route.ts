import { NextResponse } from "next/server";
import { prisma } from "database/index";
import { auth } from "@/auth";

interface conversationIdProps {
  params: {
    conversationId: string;
  };
}

export async function GET(req: Request, { params }: conversationIdProps) {
  const session = await auth();

  if (!session || !session.user) {
    return new NextResponse("Unauthorized user", { status: 401 });
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.conversationId, userId: session.user.id },
      include: {
        message: {
          include: {
            Job: true,
          },
        },
      },
    });

    if (!conversation) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (e) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
