// apps/web/components/new-chat-button.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const NewChatButton = () => {
  const router = useRouter(); 
  const [isLoading, setIsLoading] = useState(false); 

  const createNewConversation = async () => {
    setIsLoading(true); // Start loading
    try {
      const response = await axios.post("/api/conversation");
      console.log("New conversation created:", response.data); 

      const newConversation = response.data;
      if (!newConversation || !newConversation.id) {
        console.error("API did not return a valid conversation object.");
        // error case: will show toaster on error
        return;
      }

      router.push(`/conversation/${newConversation.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error creating new conversation:", error);
      //show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className={cn(
        "cursor-pointer w-full flex items-center justify-center gap-2 rounded-lg border border-border/40 bg-primary text-primary-foreground hover:bg-primary/80 shadow-sm transition-colors",
        { "opacity-50 cursor-not-allowed": isLoading } 
      )}
      onClick={createNewConversation}
      disabled={isLoading} 
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> {/* Add Loader2 icon */}
          Creating...
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" />
          New Chat
        </>
      )}
    </Button>
  );
};
