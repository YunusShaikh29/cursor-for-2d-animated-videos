// apps/web/app/(main)/(conversation)/[conversationId]/page.tsx
import { ChatMessages } from "@/components/chat/chat-messages";
import { prisma } from "database/index"; // Import prisma client
import { auth } from "@/auth"; // Import auth for session
// Remove unused imports for Server Component page
// import { NextResponse } from "next/server";
// import { Message } from "../../../../../../packages/database/generated/prisma";
// Import type for prisma query result if needed for stricter typing here
import { redirect } from "next/navigation";
import {
  Conversation as PrismaConversation,
  Message as PrismaMessage,
  Job as PrismaJob,
} from "../../../../../../packages/database/generated/prisma";

// Define a type for the fetched conversation data including relations
// This matches the shape of the data fetched by the Prisma query
interface ConversationWithMessages extends PrismaConversation {
  message: (PrismaMessage & {
    Job: PrismaJob | null; // Include the Job relation nested in messages
  })[];
}

interface ConversationIdPageProps {
  params: {
    conversationId: string;
  };
}

const ConversationIdPage = async ({ params }: ConversationIdPageProps) => {
  const conversationId = params.conversationId; // Access params directly

  const session = await auth();

  // Middleware should handle unauthorized, but this is a final check for robustness
  if (!session || !session.user) {
    // In a Server Component Page, return null or a simple error/unauthorized component
    // Avoid returning NextResponse here as it's for Route Handlers
    return (
      <div className="flex h-screen items-center justify-center">
        Unauthorized: Please sign in.{" "}
        {/* Or redirect using redirect('/api/auth/signin') */}
      </div>
    );
  }

  let conversation: ConversationWithMessages | null = null; // Type for the fetched conversation

  try {
    // Fetch the specific conversation including its messages and nested Job relation
    conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
        userId: session.user.id, // SECURITY CHECK: Ensure the conversation belongs to the logged-in user
      },
      include: {
        message: {
          // Include messages (relation name is 'message' in your schema)
          orderBy: { createdAt: "asc" }, // Order messages chronologically
          include: {
            // Include Job relation nested inside messages
            Job: true, // Make sure 'Job' matches the relation name in your schema
          },
        },
        // Add other includes if needed, e.g., user
      },
    });
  } catch (error) {
    console.error("Failed to fetch conversation and messages:", error);
    // Handle database fetch errors - show an error message on the page
    return (
      <div className="flex h-screen items-center justify-center">
        Error loading conversation.
      </div>
    );
  }

  // If the conversation was not found or didn't belong to the user
  if (!conversation) {
    // Handle this case - maybe redirect to the dashboard or show a 404 page
    // Example: Redirect to the root page which handles finding/creating a conversation
    console.warn(
      `Conversation ${conversationId} not found for user ${session.user.id}`
    );
    redirect("/"); // Redirect to home page which handles logic for logged in users
  }

  return (
    // This outer div is the flex column container that fills the space available in the layout
    // It will contain the scrollable messages area and the fixed input area
    <div className="flex h-screen flex-col">
      {" "}
      {/* h-screen to fill viewport height */}
      {/* Chat Messages Area: should grow and be scrollable */}
      {/* Pass the entire fetched conversation object to the ChatMessages client component */}
      {/* ChatMessages will handle rendering welcome, messages, and the input */}
      <ChatMessages
        conversation={conversation}
        conversationId={conversationId}
      />{" "}
      {/* Pass conversation and ID */}
      {/* The ChatInput is now rendered inside ChatMessages */}
    </div>
  );
};

export default ConversationIdPage;
