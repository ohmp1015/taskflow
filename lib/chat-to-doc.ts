// Stream AI answer with real-time chunks and persist final answer to DB
// content - document content for context
// question - user's question
// docId - document ID for saving chat
// save - callback to save final answer
// onChunk - callback for streaming UI updates
import { Id } from "@/convex/_generated/dataModel";

export async function streamDocumentAnswer(
  content: string,
  question: string,
  docId: Id<"documents">,
  save: (answer: string) => void,
  onChunk: (text: string) => void
) {
  const res = await fetch("/api/chat-to-doc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, question, docId, stream: true }),
  });

  if (!res.ok || !res.body) throw new Error("Failed to get stream from AI");

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let answer = "";
  let done = false;
  while (!done) {
    const { value, done: isDone } = await reader.read();
    done = isDone;
    const chunk = decoder.decode(value);
    answer += chunk;
    onChunk(chunk); // stream chunk to frontend
  }

  save(answer); // final full answer
}
