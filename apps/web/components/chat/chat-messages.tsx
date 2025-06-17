/* eslint-disable @typescript-eslint/no-unused-vars */
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
import axios from "axios";
import { createJobAndMessage } from "@/app/(main)/conversation/actions";
import { Loader2 } from "lucide-react";
import { ChatItem } from "./chat-item";

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
  const [currentConversation, setCurrentConversation] = useState(conversation);
  const [isPolling, setIsPolling] = useState(false);
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
      const updatedConversationResponse = await axios.get(`/api/conversation/${conversationId}`)
      setCurrentConversation(updatedConversationResponse.data)

      router.refresh();
      setInputValue("");
      setShowWelcome(false);
    } catch (error) {
      console.error("Error during message/job submission:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.message.length]);

  //polling the converations
  useEffect(() => {
    const hasPendingJobs = conversation.message.some(
      (message) =>
        message.Job &&
        (message.Job.status === "pending" ||
          message.Job.status === "processing")
    );

    if (!hasPendingJobs) {
      setIsPolling(false);
      return;
    }

    console.log("Starting polling, found pending jobs");
    setIsPolling(true);

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/conversation/${conversationId}`);
        const updatedConversation: ConversationWithMessages = response.data;

        setCurrentConversation(updatedConversation);

        const stillHasPendingJobs = updatedConversation.message.some(
          (message) =>
            message.Job &&
            (message.Job.status === "pending" ||
              message.Job.status === "processing")
        );

        if(!stillHasPendingJobs){
          setIsPolling(false)
          return
        }


      } catch (error) {
        console.log("Polling error", error);
      }
    }, 5000);

    return () => {
      console.log('cleaning up polling interval')
      clearInterval(interval)
      setIsPolling(false)
    }
    

  }, [conversationId, conversation.message]);

  return (
    <div className="flex flex-col h-full">
     <div className="flex-1 overflow-y-auto">
        {currentConversation.message.length === 0 && showWelcome ? (
          <div className="h-full flex items-center justify-center">
            <ChatWelcome />
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {currentConversation.message.map((message, index) => (
              // <div
              //   key={message.id}
              //   className={cn(
              //     "p-3 rounded-lg max-w-[80%]",
              //     message.role === "user"
              //       ? "ml-auto bg-primary text-primary-foreground"
              //       : "mr-auto bg-muted"
              //   )}
              // >
              //   <p>{message.content}</p>
              //   {message.role === "user" && message.Job && (
              //     <div className="text-xs mt-2 space-y-2">
              //       <div className="flex items-center gap-2 opacity-80">
              //         <span>Status: {message.Job.status}</span>
              //         {(message.Job.status === "pending" || 
              //           message.Job.status === "processing") && (
              //           <Loader2 className="h-3 w-3 animate-spin" />
              //         )}
              //       </div>
                    
              //       {/* 🔥 RENDER VIDEO WHEN COMPLETE */}
              //       {message.Job.status === "complete" && message.Job.videoUrl && (
              //         <div className="mt-3">
              //           <video
              //             src={message.Job.videoUrl}
              //             controls
              //             className="rounded-lg w-full max-w-md border shadow-sm"
              //             preload="metadata"
              //           >
              //             Your browser does not support the video tag.
              //           </video>
              //         </div>
              //       )}
                    
              //       {/* 🔥 SHOW PROCESSING MESSAGE */}
              //       {message.Job.status === "processing" && (
              //         <div className="text-sm text-blue-400">
              //           🎬 Generating your animation...
              //         </div>
              //       )}
                    
              //       {/* 🔥 SHOW ERROR IF FAILED */}
              //       {message.Job.status === "failed" && (
              //         <div className="text-sm text-red-400">
              //           ❌ Failed: {message.Job.error || "Unknown error"}
              //         </div>
              //       )}
              //     </div>
              //   )}
              // </div>
              <ChatItem message={message} key={message.id} index={index}/>
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
