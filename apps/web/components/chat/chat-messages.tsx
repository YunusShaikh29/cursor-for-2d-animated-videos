/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"; // This is a Client Component

import { useState, useEffect, useRef } from "react";
import { ChatWelcome } from "./chat-welcome";
import { ChatInput } from "./chat-input";
import { useRouter } from "next/navigation";
import {
  Conversation,
  Message,
  Job,
} from "@/lib/types";
import axios from "axios";
import { createJobAndMessage } from "@/app/(main)/conversation/actions";
import { ChatItem } from "./chat-item";

interface ConversationWithMessages extends Conversation {
  message: (Message & {
    Job: Job | null;
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
      console.log("Submitting message/job with values:", values);
      if (!values.prompt.trim()) {
        console.warn("Prompt is empty, not submitting.");
        return;
      }
      const response = await createJobAndMessage(
        conversationId,
        values.prompt.trim()
      );

      const result = await response.data;
      console.log("Server action response:", result);
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
