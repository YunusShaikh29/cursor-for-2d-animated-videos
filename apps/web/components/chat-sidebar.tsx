import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import { ModeToggle } from "./mode-toggle";
import { UserAvatarButton } from "./user-avatar-button";
import { NewChatButton } from "./new-chat-button";
import { ChatList } from "./chat-list";
import { auth } from "@/auth";
import { ChatListProps } from "./chat-list";

export async function ChatSidebar() {
  const session = await auth();
  const userId = session?.user?.id;

  let conversationsList: ChatListProps[] = [];

  try {
    if (userId) {
      const fetchedConversations = await prisma?.conversation.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      conversationsList = fetchedConversations as ChatListProps[];
    }
  } catch (e) {
    console.log(e);
  }

  return (
    <Sidebar>
      <SidebarHeader className="m-auto text-xl">Text2Scene</SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <NewChatButton />
        </SidebarGroup>
        <SidebarGroup>
          <ChatList conversationList={conversationsList} />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
        <UserAvatarButton />
      </SidebarFooter>
    </Sidebar>
  );
}
