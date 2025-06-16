'use client';

import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, MoreVertical, Edit3, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

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

  if (conversationList.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">No conversations yet</p>
      </div>
    );
  }

  const handleRename = (conversationId: string) => {
    console.log('Rename conversation:', conversationId);
    // TODO: Implement rename functionality
  };

  const handleDelete = (conversationId: string) => {
    console.log('Delete conversation:', conversationId);
    // TODO: Implement delete functionality
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
          >
            <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0 text-left">
              <div className="flex flex-col gap-1">
                <span className="truncate font-medium text-sm">
                  {conversation.title || 'New conversation'}
                </span>
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
                    handleRename(conversation.id);
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