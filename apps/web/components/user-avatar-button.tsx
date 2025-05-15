'use client';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { AvatarFallback, AvatarImage, Avatar } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { ModeToggle } from "./mode-toggle";

export const UserAvatarButton = () => {
  const session = useSession();

  if (!session || !session.data) {
    return 
  }

  if (!session.data.user?.image) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg border border-border/40 p-2 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.data.user?.image} alt={session.data.user?.name || 'User'} />
            <AvatarFallback>
              {session.data.user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{session.data.user.name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};