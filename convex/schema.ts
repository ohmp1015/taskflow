import { defineSchema, defineTable, v } from "convex/schema";


export default defineSchema({
  documents: defineTable({
    title: v.string(),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isArchived: v.boolean(),
    isPublished: v.boolean(),
    parentDocument: v.optional(v.id("documents")),
    userId: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentDocument"])
    .index("by_user_archived", ["userId", "isArchived"])
    .index("by_user_published", ["userId", "isPublished"]),

  translatedDocuments: defineTable({
    documentId: v.id("documents"),
    targetLang: v.string(),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_document", ["documentId"]),

  chats: defineTable({
    documentId: v.id("documents"),
    question: v.string(),
    answer: v.string(),
    createdAt: v.number(),
  }).index("by_document", ["documentId"]),

  // Invitation system tables
  invitations: defineTable({
    documentId: v.id("documents"),
    invitedBy: v.string(),
    invitedEmail: v.string(),
    role: v.union(v.literal("viewer"), v.literal("editor")),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined")),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_document", ["documentId"])
    .index("by_email", ["invitedEmail"])
    .index("by_status", ["status"]),

  documentAccess: defineTable({
    documentId: v.id("documents"),
    userId: v.string(),
    role: v.union(v.literal("viewer"), v.literal("editor")),
    invitedBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_document", ["documentId"])
    .index("by_user", ["userId"]),

  requestAccess: defineTable({
    documentId: v.id("documents"),
    userId: v.string(),
    reason: v.optional(v.string()),
    createdAt: v.number(),
  }),

  presence: defineTable({
    documentId: v.id("documents"),
    userId: v.string(),
    name: v.string(),
    avatarUrl: v.string(),
    lastSeen: v.number(),
  }).index("by_document", ["documentId"]),
});
