"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ModeToggle } from "./mode-toggle";
import { UserAvatarButton } from "./user-avatar-button";

export function ChatSidebar() {
  const session = useSession();
  if (!session) {
    return redirect("api/auth/signin");
  }

  return (
    <Sidebar>
      <SidebarHeader>Welcome to animated videos</SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
        <UserAvatarButton />
      </SidebarFooter>
    </Sidebar>
  );
}
