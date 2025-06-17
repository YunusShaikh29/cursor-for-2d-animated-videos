/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useRef } from "react";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { SendHorizonal, Loader2 } from "lucide-react";

const formSchema = z.object({
  prompt: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

interface ChatInputProps {
  conversationId: string;
  onSubmit: (values: FormValues) => Promise<void>;
  onInputChange?: (value: string) => void;
  isLoading?: boolean;
  value?: string;
}

export const ChatInput = ({ 
  onSubmit, 
  onInputChange, 
  isLoading,
  value 
}: ChatInputProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: value || "",
    },
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight > 200 ? '200px' : `${scrollHeight}px`;
    }
  }, [form.watch("prompt")]);

  useEffect(() => {
    if (value !== undefined) {
      form.setValue("prompt", value);
    }
  }, [value, form]);

  const handleFormSubmit = async (values: FormValues) => {
    if (values.prompt.trim() === '') return;
    await onSubmit(values);
    form.reset();
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="relative flex justify-center w-full items-center gap-2 rounded-lg border bg-background p-2 shadow-sm focus-within:ring-1 focus-within:ring-ring"
      >
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Textarea
                  ref={textareaRef}
                  placeholder="Type your animation idea here..."
                  className="min-h-[44px] w-full resize-none border-0 bg-transparent p-2 focus-visible:ring-0"
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    onInputChange?.(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      const value = form.getValues("prompt");
                      if (value.trim() !== '') {
                        form.handleSubmit(handleFormSubmit)();
                      }
                    }
                  }}
                  rows={1}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="icon"
          className="h-8 w-8"
          disabled={!form.formState.isValid || form.formState.isSubmitting || isLoading}
        >
          {form.formState.isSubmitting || isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizonal className="h-4 w-4" />
          )}
        </Button>
      </form>
    </Form>
  );
};