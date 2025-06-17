/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */
"use client";

import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Type,
  Download,
  Wand2,
  Shapes,
  Zap,
  Quote, 
} from "lucide-react";
import Link from "next/link";


const examples = [
  {
    prompt:
      "Animate a tree data structure being built.",
      videoSrc: "/videos/example-1.mp4", 
  },
  {
    prompt:
      "create a long 30 second video explaining how neural network works.",
    videoSrc: "/videos/example-2.mp4", 
  },
];

export const LandingPage = () => {
  const FADE_IN_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" } },
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-bold">Cursor 2D</span>
          </Link>
          <Link href="/api/auth/signin">
            <Button>
              Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto flex max-w-5xl flex-col items-center justify-center gap-6 py-24 text-center">
          <motion.div
            initial="hidden"
            animate="show"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.15 } },
            }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              variants={FADE_IN_ANIMATION_VARIANTS}
              className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
            >
              Powered by AI & Manim
            </motion.div>
            <motion.h1
              variants={FADE_IN_ANIMATION_VARIANTS}
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            >
              Create Stunning 2D Animations with a Single Prompt
            </motion.h1>
            <motion.p
              variants={FADE_IN_ANIMATION_VARIANTS}
              className="max-w-2xl text-lg text-muted-foreground"
            >
              Describe your vision in plain English, and our AI assistant will
              generate a beautiful, ready-to-use video animation for you. No
              complex software needed.
            </motion.p>
            <motion.div variants={FADE_IN_ANIMATION_VARIANTS}>
              <Link href="/api/auth/signin">
                <Button size="lg" className="mt-4">
                  Get Started for Free
                  <Wand2 className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        <section id="features" className="bg-muted/50 py-20">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">Why You&apos;ll Love Cursor 2D</h2>
              <p className="mt-2 text-muted-foreground">
                Everything you need to bring your ideas to life.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                icon={<Wand2 className="h-8 w-8 text-primary" />}
                title="AI-Powered Creation"
                description="Just type what you want to see. Our AI understands your request and writes the animation code for you."
              />
              <FeatureCard
                icon={<Shapes className="h-8 w-8 text-primary" />}
                title="High-Quality Engine"
                description="Built on the powerful Manim engine, ensuring your animations are smooth, precise, and professional-grade."
              />
              <FeatureCard
                icon={<Zap className="h-8 w-8 text-primary" />}
                title="Simple & Fast Workflow"
                description="From prompt to final video in minutes. Download your MP4 and use it anywhere, hassle-free."
              />
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mt-2 text-muted-foreground">
              A simple three-step process to your perfect animation.
            </p>
            <div className="mt-12 grid gap-12 md:grid-cols-3">
              <HowItWorksStep
                icon={<Type className="h-10 w-10" />}
                step="1. Describe"
                description="Write a clear, descriptive prompt of the animation you want to create."
              />
              <HowItWorksStep
                icon={<Bot className="h-10 w-10" />}
                step="2. Generate"
                description="Our AI processes your request, generates the Manim code, and renders the video."
              />
              <HowItWorksStep
                icon={<Download className="h-10 w-10" />}
                step="3. Download"
                description="Preview your animation and download the final MP4 file to use anywhere."
              />
            </div>
          </div>
        </section>

        <section id="examples" className="bg-muted/50 py-20">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">See It In Action</h2>
              <p className="mt-2 text-muted-foreground">
                From a simple prompt to a finished animation.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              {examples.map((example, i) => (
                <ExampleCard
                  key={i}
                  prompt={example.prompt}
                  videoSrc={example.videoSrc}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Cursor 2D. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: any) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <Card className="h-full text-center">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

const HowItWorksStep = ({ icon, step, description }: any) => (
  <div className="flex flex-col items-center gap-4">
    <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-primary/50 bg-muted/50 text-primary">
      {icon}
    </div>
    <h3 className="text-xl font-semibold">{step}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const ExampleCard = ({ prompt, videoSrc }: any) => (
  <Card className="overflow-hidden">
    <CardHeader>
      <blockquote className="flex items-start gap-3 border-l-2 pl-4 italic text-muted-foreground">
        <Quote className="h-5 w-5 shrink-0" />
        <span>{prompt}</span>
      </blockquote>
    </CardHeader>
    <CardContent>
      <div className="aspect-video overflow-hidden rounded-lg border bg-black">
        <video
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </CardContent>
  </Card>
);