import { NextResponse } from "next/server";
import { prisma } from "database/index";
import { auth } from "@/auth";
import { storageClient } from "shared/storage";

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

    const videoUrls = jobs
      .map(job => job.videoUrl)
      .filter((url): url is string => url !== null);

    // Delete videos from storage
    if (videoUrls.length > 0) {
      const deleteResults = await storageClient.deleteFilesByUrls(videoUrls);
      
      if (deleteResults.failed.length > 0) {
        console.error(`Failed to delete ${deleteResults.failed.length} videos:`, deleteResults.failed);
      }
      
      if (deleteResults.success.length > 0) {
        console.log(`Successfully deleted ${deleteResults.success.length} videos`);
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