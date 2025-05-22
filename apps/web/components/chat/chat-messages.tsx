"use client"; // This is a Client Component

import { useState, useEffect, useRef } from "react";
import { ChatWelcome } from "./chat-welcome";
import { ChatInput } from "./chat-input";
import { useRouter } from "next/navigation";
import {
  Conversation as PrismaConversation,
  Message as PrismaMessage,
  Job as PrismaJob,
} from "../../../../packages/database/generated/prisma";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import axios from "axios";
import { createJobAndMessage } from "@/app/(main)/conversation/actions";

interface ConversationWithMessages extends PrismaConversation {
  message: (PrismaMessage & {
    Job: PrismaJob | null;
  })[];
}

interface ChatMessagesProps {
  conversation: ConversationWithMessages;
  conversationId: string;
}

export const ChatMessages = ({
  conversation,
  conversationId,
}: ChatMessagesProps) => {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [showWelcome, setShowWelcome] = useState(
    conversation.message.length === 0
  );
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setShowWelcome(value.trim() === "" && conversation.message.length === 0);
  };

  const handleFormSubmit = async (values: { prompt: string }) => {
    setIsLoading(true);
    try {
      const response = await createJobAndMessage(
        conversationId,
        values.prompt.trim()
      );

      // const result = await response.data;
      console.log("Message/Job creation successful:", response);
      router.refresh();
      setInputValue("");
      setShowWelcome(false);
    } catch (error) {
      console.error("Error during message/job submission:", error);
    }finally {
      setIsLoading(false)
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.message.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {conversation.message.length === 0 && showWelcome ? (
          <div className="h-full flex items-center justify-center">
            <ChatWelcome />
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {conversation.message.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "p-3 rounded-lg max-w-[80%]",
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "mr-auto bg-muted"
                )}
              >
                <p>{message.content}</p>
                {message.role === "user" && message.Job && (
                  <div className="text-xs mt-1 opacity-80">
                    Job Status: {message.Job.status}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-background p-4">
        <ChatInput
          conversationId={conversationId}
          onSubmit={handleFormSubmit}
          onInputChange={(value) => handleInputChange(value)}
          value={inputValue}
        />
      </div>
    </div>
  );
};
