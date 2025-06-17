'use client';

import { motion } from 'framer-motion';
import { Message as PrismaMessage, Job as PrismaJob } from "../../../../packages/database/generated/prisma";
import { cn } from '@/lib/utils';
import { Loader2, Download, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LazyLoad } from '../lazy-load';

interface MessageWithJob extends PrismaMessage {
  Job: PrismaJob | null;
}

interface ChatItemProps {
  message: MessageWithJob;
  index: number;
}

export const ChatItem = ({ message, index }: ChatItemProps) => {
  const isUser = message.role === 'user';
  const job = message.Job;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'processing':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'complete':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'complete':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Queued for processing...';
      case 'processing':
        return 'Creating your animation...';
      case 'complete':
        return 'Animation ready!';
      case 'failed':
        return 'Generation failed';
      default:
        return status;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={cn(
        "flex w-full mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "max-w-[85%] space-y-3",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Message Content */}
        <div className={cn(
          "rounded-2xl px-4 py-3 shadow-sm",
          isUser 
            ? "bg-primary text-primary-foreground ml-auto" 
            : "bg-muted text-muted-foreground"
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Job Status and Video */}
        {isUser && job && (
          <Card className="w-full border-0 shadow-md bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "flex items-center gap-2 px-3 py-1",
                    getStatusColor(job.status)
                  )}
                >
                  {getStatusIcon(job.status)}
                  <span className="text-xs font-medium">
                    {getStatusMessage(job.status)}
                  </span>
                </Badge>
                
                {job.status === 'complete' && job.videoUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = job.videoUrl!;
                      link.download = `animation-${job.id}.mp4`;
                      document.body.appendChild(link)
                      link.click();
                      document.body.removeChild(link)
                    }}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                )}
              </div>

              {/* Processing Animation */}
              {job.status === 'processing' && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Generating your 2D animation...
                  </span>
                </div>
              )}

              {/* Video Player */}
              {job.status === 'complete' && job.videoUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative group"
                >
                  <LazyLoad src={job.videoUrl}/>
                  
                  {/* Video Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg pointer-events-none" />
                </motion.div>
              )}

              {/* Error State */}
              {job.status === 'failed' && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                      Animation generation failed
                    </p>
                    {job.error && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                       {job.error.length > 50 ? "Failed to create the video!": job.error}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className="flex justify-end">
                <span className="text-xs text-muted-foreground">
                  {new Date(message.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assistant message timestamp */}
        {!isUser && (
          <div className="flex justify-start">
            <span className="text-xs text-muted-foreground">
              {new Date(message.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};