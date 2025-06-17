import { NextResponse } from "next/server";
import { prisma } from "database/index";
import { auth } from "@/auth";
import { minioClient } from "@/lib/minio";

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
  } catch (error) {
    return new NextResponse(`Internal Server Error: ${error}`, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: conversationIdProps) {
  const session = await auth();
  const { newTitle } = await req.json();

  if (!session || !session.user) {
    return new NextResponse("Unauthorized user", { status: 401 });
  }

  try {
    const updatedConversation = await prisma.conversation.update({
      where: {
        id: params.conversationId,
        userId: session.user.id,
      },
      data: {
        title: newTitle,
      },
    });
    return NextResponse.json(updatedConversation);
  } catch (error) {
    console.log("[CONVERSATION_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: conversationIdProps) {
  const session = await auth();

  if (!session || !session.user) {
    return new NextResponse("Unauthorized user", { status: 401 });
  }

  try {
    const jobs = await prisma.job.findMany({
      where: {
        message: {
          conversationId: params.conversationId,
        },
        videoUrl: {
          not: null,
        },
      },
      select: {
        videoUrl: true,
      },
    });

    //deleting videos from minio
    for (const job of jobs) {
      if (job.videoUrl) {
        try {
          const url = new URL(job.videoUrl);
          const objectName = url.pathname.replace(/^\/video-assets\//, "");
          await minioClient.removeObject("video-assets", objectName);
        } catch (error) {
          console.error("Failed to delete video from MinIO:", error);
        }
      }
    }

    await prisma.conversation.delete({
      where: {
        id: params.conversationId,
        userId: session.user.id,
      },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CONVERSATION_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
