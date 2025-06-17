"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquare, MoreVertical, Edit3, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { Input } from "./ui/input";

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
  const router = useRouter();
  const pathname = usePathname();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  if (conversationList.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">No conversations yet</p>
      </div>
    );
  }

  const handleRename = (conversationId: string, currentTitle: string) => {
    setRenamingId(conversationId);
    setRenameValue(currentTitle || "");
  };

  const handleRenameSubmit = async (conversationId: string, currentConversationTitle: string) => {
    if (!renameValue.trim()) return;
    if(renameValue.trim() === currentConversationTitle){
      setRenameValue("")
      setRenamingId(null)
      return
    }

    try {
      const res = await axios.patch(`/api/conversation/${conversationId}`, {
        newTitle: renameValue.trim(),
      });
      setRenameValue("");
      setRenamingId(null);
      router.refresh();
      return res.data;
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (conversationId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this conversation? This will delete all the videos in this conversation and this is irreversible!"
      )
    ) {
      return;
    }

    try {
      const response = await axios.delete(
        `/api/conversation/${conversationId}`
      );
      if (response.status === 204) {
        router.refresh();
      }
    } catch (error) {
      // alert("Error deleting conversation.");
      console.error(error);
    }
  };

  return (
    <div className="space-y-1 px-2 py-1">
      {conversationList.map((conversation) => (
        <div
          key={conversation.id}
          className="group relative"
          onMouseEnter={() => setHoveredId(conversation.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <button
            className={cn(
              "relative w-full flex items-center gap-3 rounded-lg p-3 text-sm transition-all",
              "hover:bg-accent/80 focus-visible:bg-accent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              pathname.includes(conversation.id)
                ? "bg-accent text-accent-foreground"
                : "text-foreground hover:text-accent-foreground"
            )}
            onClick={() => router.push(`/conversation/${conversation.id}`)}
            disabled={renamingId === conversation.id}
          >
            <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0 text-left">
              <div className="flex flex-col gap-1">
                {renamingId === conversation.id ? (
                  <Input
                    value={renameValue}
                    autoFocus
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(conversation.id, conversation.title || "")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRenameSubmit(conversation.id, conversation.title || "");
                      } else if (e.key === "Escape") {
                        setRenameValue("");
                        setRenamingId(null);
                      }
                    }}
                    className="text-sm font-medium"
                  />
                ) : (
                  <span className="truncate text-sm font-medium">
                    {conversation.title || "New Conversation"}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(conversation.updatedAt, {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </button>

          {/* Three-dot menu that slides in from the right */}
          <div
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 transition-all duration-200 ease-in-out",
              hoveredId === conversation.id
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-2 pointer-events-none"
            )}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md",
                    "bg-background/80 backdrop-blur-sm border border-border/40",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "transition-all duration-150"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="right"
                className="w-48 animate-in slide-in-from-left-2 duration-200"
                sideOffset={8}
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename(conversation.id, conversation.title || "");
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Edit3 className="h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(conversation.id);
                  }}
                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
};
