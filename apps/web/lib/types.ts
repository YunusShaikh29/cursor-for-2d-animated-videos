export type Conversation = {
    title: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
}

export type Job = {
    script: string | null;
    id: string;
    status: "pending" | "processing" | "complete" | "failed";
    createdAt: Date;
    updatedAt: Date;
    videoUrl: string | null;
    error: string | null;
    messageId: string | null;
}

export type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    conversationId: string;
    createdAt: Date;
    updatedAt: Date;
}