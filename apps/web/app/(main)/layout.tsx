import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat-sidebar";
import { SessionProvider } from "next-auth/react";
import { getToken } from "next-auth/jwt";
import { prisma } from "database/index";
import React from "react";
import { auth } from "@/auth";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const token = await getToken({req, secret: process.env.AUTH_SECRET})
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <SidebarProvider>
      <ChatSidebar />
      <main className="flex-grow overflow-y-auto">
        <SidebarTrigger className="fixed"/>
        {children}
      </main>
    </SidebarProvider>
  );
}
