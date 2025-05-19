/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { redirect, useRouter } from "next/navigation";

export interface ChatListProps {
  id: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export const ChatList = ({
  conversationList,
}: {
  conversationList: ChatListProps[];
}) => {

  const router = useRouter()
  

  if (conversationList.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">No conversations yet</p>
      </div>
    );
  }


  return (
    <div className="space-y-0.5 px-2 py-1">
      {conversationList.map((conversation) => (
        <div key={conversation.id} className="group relative">
          <button
            className={cn(
              "relative w-full flex items-center gap-3 rounded-lg p-3 text-sm transition-all cursor-pointer",
              "hover:bg-accent focus-visible:bg-accent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            onClick={() => router.push(`/conversation/${conversation.id}`)}
          >
            <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">
                  {conversation.title || "New conversation"}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(conversation.updatedAt, {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </button>
        </div>
      ))}
    </div>
  );
};
