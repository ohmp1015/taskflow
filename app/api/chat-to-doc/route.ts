// Handles chat requests with OpenAI and saves chat to Convex DB
import { NextRequest } from "next/server";
import OpenAI from "openai";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const { content, question, docId, stream } = await req.json();

  const messages = [
    {
      role: "system",
      content: `You are a helpful assistant. Use the following document content to answer any questions:\n\n${content}`,
    },
    { role: "user", content: question },
  ];

  if (stream) {
    const encoder = new TextEncoder();
    let fullAnswer = "";

    const streamRes = new ReadableStream({
      async start(controller) {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          stream: true,
          messages,
        });

        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content || "";
          fullAnswer += text;
          controller.enqueue(encoder.encode(text));
        }

        // Save final full response to DB
        await convex.mutation(api.documents.saveChatMessage, {
          documentId: docId,
          question,
          answer: fullAnswer,
        });

        controller.close();
      },
    });

    return new Response(streamRes, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }

  const result = await openai.chat.completions.create({ model: "gpt-4", messages });
  const answer = result.choices[0].message.content?.trim() || "";

  // Save single-shot answer to DB
  await convex.mutation(api.documents.saveChatMessage, {
    documentId: docId,
    question,
    answer,
  });

  return new Response(JSON.stringify({ answer }), { headers: { "Content-Type": "application/json" } });
}
