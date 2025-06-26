// apps/web/app/(main)/(conversation)/[conversationId]/page.tsx
import { ChatMessages } from "@/components/chat/chat-messages";
import { prisma } from "database"; // Import prisma client
import { auth } from "@/auth"; // Import auth for session
// Remove unused imports for Server Component page
// import { NextResponse } from "next/server";
// import { Message } from "../../../../../../packages/database/generated/prisma";
// Import type for prisma query result if needed for stricter typing here
import { redirect } from "next/navigation";
import { Conversation, Message, Job } from "@/lib/types";

interface ConversationWithMessages extends Conversation {
  message: (Message & {
    Job: Job | null;
  })[];
}

interface ConversationIdPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

const ConversationIdPage = async ({ params }: ConversationIdPageProps) => {
  const { conversationId } = await params;

  const session = await auth();

  if (!session || !session.user) {
    return (
      <div className="flex h-screen items-center justify-center">
        Unauthorized: Please sign in.{" "}
      </div>
    );
  }

  let conversation: ConversationWithMessages | null = null;

  try {
    conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
        userId: session.user.id,
      },
      include: {
        message: {
          orderBy: { updatedAt: "asc" },
          include: {
            Job: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch conversation and messages:", error);
    return (
      <div className="flex h-screen items-center justify-center">
        Error loading conversation.
      </div>
    );
  }

  if (!conversation) {
    console.warn(
      `Conversation ${conversationId} not found for user ${session.user.id}`
    );
    redirect("/");
  }

  return (
    <div className="flex h-screen flex-col">
      <ChatMessages
        conversation={conversation}
        conversationId={conversationId}
      />
    </div>
  );
};

export default ConversationIdPage;
