'use client';

import { motion } from 'framer-motion';
import { Bot, Wand2, Shapes } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export const ChatWelcome = () => {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-8 w-8 text-primary" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Welcome to Cursor 2D Animation
            </CardTitle>
            <CardDescription className="text-center text-base">
              Create beautiful 2D animations with natural language
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent">
                <Wand2 className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">AI-Powered Creation</h3>
                  <p className="text-sm text-muted-foreground">
                    Describe your animation in plain English and watch it come to life
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent">
                <Shapes className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Dynamic Shapes</h3>
                  <p className="text-sm text-muted-foreground">
                    Create complex animations with geometric shapes and transformations
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Type your animation description below to get started
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}