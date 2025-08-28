// Client component for displaying document-based AI chat
"use client";

import { useEffect, useState } from "react";
import { streamDocumentAnswer } from "@/lib/chat-to-doc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface ChatToDocProps {
  content: string;
  documentId: Id<"documents">;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function ChatToDoc({ content, documentId }: ChatToDocProps) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Load chat history from Convex
  const savedChats = useQuery(api.documents.getChatMessages, { documentId });
  const saveChatMessage = useMutation(api.documents.saveChatMessage);

  // Set state when chat loads
  useEffect(() => {
    if (savedChats) {
      const loaded = savedChats.flatMap((chat) => [
        { role: "user" as const, content: chat.question },
        { role: "assistant" as const, content: chat.answer },
      ]);
      setMessages(loaded);
    }
  }, [savedChats]);

  // Handle asking question + streaming answer
  const handleAsk = async () => {
    if (!question.trim()) return;
    const userQuestion = question.trim();
    const newMessages: ChatMessage[] = [
      ...messages, 
      { role: "user" as const, content: userQuestion }, 
      { role: "assistant" as const, content: "" }
    ];
    setMessages(newMessages);
    setQuestion("");
    setLoading(true);

    try {
      await streamDocumentAnswer(
        content, 
        userQuestion, 
        documentId, 
        async (finalAnswer: string) => {
          // Save the complete chat message to database
          await saveChatMessage({
            documentId,
            question: userQuestion,
            answer: finalAnswer,
          });
        }, 
        (chunk) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === "assistant") last.content += chunk;
            return [...updated];
          });
        }
      );
    } catch (err) {
      console.error("Error getting AI response:", err);
      // Remove the empty assistant message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-4 border rounded-xl space-y-4 bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold">🤖 Ask AI about this document</h3>

      {/* Render all chat messages */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`rounded-lg px-3 py-2 max-w-xl text-sm whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-blue-100 dark:bg-blue-900 self-end text-right ml-auto"
                : "bg-gray-100 dark:bg-gray-700 text-left mr-auto"
            }`}
          >
            <strong className="block text-xs text-gray-500 mb-1">
              {msg.role === "user" ? "You" : "Assistant"}
            </strong>
            {msg.content}
          </div>
        ))}
      </div>

      {/* Input + submit */}
      <div className="flex gap-2">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the document"
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAsk();
            }
          }}
        />
        <Button onClick={handleAsk} disabled={loading || !question.trim()}>
          {loading ? "Thinking..." : "Ask"}
        </Button>
      </div>
    </div>
  );
}
