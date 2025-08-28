// ✅ FILE: convex/chats.ts
// ✅ PURPOSE: Save and retrieve document-specific chat messages using Convex v1+

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// Save a new chat message for a specific document
export const saveChatMessage = mutation({
  args: {
    documentId: v.id("documents"),
    question: v.string(),
    answer: v.string(),
  },
  handler: async (
    ctx,
    args: { documentId: Id<"documents">; question: string; answer: string }
  ) => {
    await ctx.db.insert("chats", {
      documentId: args.documentId,
      question: args.question,
      answer: args.answer,
      createdAt: Date.now(),
    });
  },
});

// Retrieve all chat messages related to a specific document
export const getChatMessages = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (
    ctx,
    args: { documentId: Id<"documents"> }
  ): Promise<Doc<"chats">[]> => {
    return await ctx.db
      .query("chats")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .order("asc")
      .collect();
  },
});
