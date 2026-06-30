"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  AlertCircle,
  RefreshCcw,
  Minimize2,
  Maximize2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ==========================================
// TYPES
// ==========================================

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatPanelProps {
  module: string;
  systemPrompt?: string;
  onAnalyze?: () => void;
  analyzeLabel?: string;
  className?: string;
}

// ==========================================
// AI CHAT PANEL COMPONENT
// ==========================================

export function AIChatPanel({
  module,
  systemPrompt,
  onAnalyze,
  analyzeLabel = "Analyze Data",
  className,
}: AIChatPanelProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [isAvailable, setIsAvailable] = React.useState<boolean | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Check AI availability on mount
  React.useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/ai/status");
        const data = await res.json();
        setIsAvailable(data.available && data.hasDefaultModel);
      } catch {
        setIsAvailable(false);
      }
    }
    checkStatus();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          module,
          systemPrompt,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to get AI response");
      }

      const data = await res.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
  };

  if (isMinimized) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn("fixed bottom-4 right-4 gap-2", className)}
        onClick={() => setIsMinimized(false)}
      >
        <Bot className="h-4 w-4" />
        AI Assistant
        <Maximize2 className="h-3 w-3" />
      </Button>
    );
  }

  return (
    <Card className={cn("flex flex-col h-[500px]", className)}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">AI Assistant</CardTitle>
          {isAvailable === true && (
            <Badge variant="outline" className="text-xs text-green-600 border-green-600">
              Online
            </Badge>
          )}
          {isAvailable === false && (
            <Badge variant="outline" className="text-xs text-red-600 border-red-600">
              Offline
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMinimized(true)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-4 overflow-hidden">
        {isAvailable === false ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">AI Assistant Unavailable</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ollama is not running or the model is not installed.
            </p>
            <code className="text-xs bg-muted p-2 rounded">
              ollama serve && ollama pull llama3.2
            </code>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <Sparkles className="h-12 w-12 text-primary/50 mb-4" />
            <h3 className="font-medium mb-2">How can I help you?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ask questions about your {module.toLowerCase()} data or get AI-powered insights.
            </p>
            {onAnalyze && (
              <Button onClick={onAnalyze} className="gap-2">
                <Sparkles className="h-4 w-4" />
                {analyzeLabel}
              </Button>
            )}
          </div>
        ) : (
          <ScrollArea className="h-full pr-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {error && (
        <div className="px-4 pb-2">
          <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 ml-auto"
              onClick={() => setError(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      <CardFooter className="pt-2">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Textarea
            placeholder={
              isAvailable === false
                ? "AI Assistant unavailable..."
                : "Ask me anything..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || isAvailable === false}
            className="min-h-[40px] max-h-[120px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="flex flex-col gap-1">
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim() || isAvailable === false}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
            {messages.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="h-8 w-8"
              >
                <RefreshCcw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}

// ==========================================
// AI INSIGHTS BUTTON
// ==========================================

interface AIInsightsButtonProps {
  module: "sales" | "inventory" | "hr" | "finance" | "projects";
  onInsights?: (insights: string) => void;
  className?: string;
}

export function AIInsightsButton({
  module,
  onInsights,
  className,
}: AIInsightsButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [insights, setInsights] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      const data = await res.json();
      setInsights(data.analysis);
      onInsights?.(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        onClick={handleAnalyze}
        disabled={isLoading}
        variant="outline"
        className="gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        AI Insights
      </Button>

      {insights && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{insights}</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="mt-4 bg-destructive/10 text-destructive rounded-lg p-3 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
