import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "database";

import { LandingPage } from "@/components/landing-page";

export default async function Home() {
  const session = await auth();
  const userId = session?.user?.id;

  console.log("DEBUGGING SESSION, page.tsx: ", session)
  console.log("DEBUGGING SESSION, page.tsx: ", session?.user)
  console.log("DEBUGGING SESSION, page.tsx: ", session?.user?.id)

  if (!session?.user) {
    return <LandingPage />;
  }

  const latestConversation = await prisma.conversation.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  let conversationId;

  if (latestConversation) {
    conversationId = latestConversation.id;
  } else {
    const newConversation = await prisma.conversation.create({
      data: {
        userId: userId as string,
        title: "New Animation",
      },
      select: { id: true },
    });
    conversationId = newConversation.id;
  }

  redirect(`/conversation/${conversationId}`);
}
