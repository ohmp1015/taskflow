import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// Invitation system mutations and queries
export const createInvitation = mutation({
  args: {
    documentId: v.id("documents"),
    invitedEmail: v.string(),
    role: v.union(v.literal("viewer"), v.literal("editor")),
    invitedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const existingDocument = await ctx.db.get(args.documentId);

    if (!existingDocument) throw new Error("Document not found");
    if (existingDocument.userId !== userId) throw new Error("Unauthorized");

    // Check if invitation already exists
    const existingInvitation = await ctx.db
      .query("invitations")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .filter((q) => q.eq(q.field("invitedEmail"), args.invitedEmail))
      .first();

    if (existingInvitation) {
      throw new Error("Invitation already exists for this email");
    }

    // Create invitation with 7-day expiration
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    await ctx.db.insert("invitations", {
      documentId: args.documentId,
      invitedBy: args.invitedBy,
      invitedEmail: args.invitedEmail,
      role: args.role,
      status: "pending",
      expiresAt,
      createdAt: Date.now(),
    });
  },
});

export const getInvitationsForDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const existingDocument = await ctx.db.get(args.documentId);

    if (!existingDocument) return [];
    if (existingDocument.userId !== userId) return [];

    return await ctx.db
      .query("invitations")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .order("desc")
      .collect();
  },
});

export const getInvitationsForEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("invitedEmail", args.email))
      .collect();

    const now = Date.now();
    return invitations.filter(
      (invitation) => invitation.status === "pending" && invitation.expiresAt > now
    );
  },
});

export const acceptInvitation = mutation({
  args: { invitationId: v.id("invitations"), userId: v.string() },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) throw new Error("Invitation not found");
    if (invitation.status !== "pending") throw new Error("Invitation already processed");
    if (invitation.expiresAt < Date.now()) throw new Error("Invitation expired");

    // Update invitation status
    await ctx.db.patch(args.invitationId, { status: "accepted" });

    // Grant access to the document
    await ctx.db.insert("documentAccess", {
      documentId: invitation.documentId,
      userId: args.userId,
      role: invitation.role,
      invitedBy: invitation.invitedBy,
      createdAt: Date.now(),
    });
  },
});

export const declineInvitation = mutation({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) throw new Error("Invitation not found");
    if (invitation.status !== "pending") throw new Error("Invitation already processed");

    await ctx.db.patch(args.invitationId, { status: "declined" });
  },
});

export const deleteInvitation = mutation({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const invitation = await ctx.db.get(args.invitationId);

    if (!invitation) throw new Error("Invitation not found");

    // Check if user is the document owner
    const document = await ctx.db.get(invitation.documentId);
    if (!document || document.userId !== userId) throw new Error("Unauthorized");

    await ctx.db.delete(args.invitationId);
  },
});

// Grant document access to another user
export const grantAccess = mutation({
  args: {
    documentId: v.id("documents"),
    userId: v.string(),
    role: v.union(v.literal("viewer"), v.literal("editor")),
    invitedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUserId = identity.subject;
    const existingDocument = await ctx.db.get(args.documentId);

    if (!existingDocument) throw new Error("Document not found");
    if (existingDocument.userId !== currentUserId) throw new Error("Unauthorized");

    const exists = await ctx.db
      .query("documentAccess")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!exists) {
      await ctx.db.insert("documentAccess", {
        ...args,
        createdAt: Date.now(),
      });
    }
  },
});

// Get all users with access to a document
export const getDocumentAccessList = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const existingDocument = await ctx.db.get(args.documentId);

    if (!existingDocument) return [];
    if (existingDocument.userId !== userId) return [];

    return await ctx.db
      .query("documentAccess")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();
  },
});

// Request access to a document
export const requestAccess = mutation({
  args: {
    documentId: v.id("documents"),
    userId: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("requestAccess")
      .filter((q) =>
        q.and(
          q.eq(q.field("documentId"), args.documentId),
          q.eq(q.field("userId"), args.userId)
        )
      )
      .first();

    if (!existing) {
      await ctx.db.insert("requestAccess", {
        ...args,
        createdAt: Date.now(),
      });
    }
  },
});

// Get access requests for documents owned by current user
export const getAccessRequestsForOwner = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("userId"), args.ownerId))
      .collect();

    const requests = await Promise.all(
      documents.map(doc =>
        ctx.db
          .query("requestAccess")
          .filter((q) => q.eq(q.field("documentId"), doc._id))
          .collect()
      )
    );

    return requests.flat();
  },
});

// Delete a request once it's handled
export const deleteAccessRequest = mutation({
  args: { requestId: v.id("requestAccess") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.requestId);
  },
});

// Verify user has access to document
export const getDocumentWithAccessCheck = query({
  args: { documentId: v.id("documents"), userId: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) return null;

    if (doc.userId === args.userId) return doc;

    const access = await ctx.db
      .query("documentAccess")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!access) return null;

    return doc;
  },
});

// Real-time presence update
export const updatePresence = mutation({
  args: {
    documentId: v.id("documents"),
    userId: v.string(),
    name: v.string(),
    avatarUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastSeen: now,
        avatarUrl: args.avatarUrl,
        name: args.name,
      });
    } else {
      await ctx.db.insert("presence", {
        ...args,
        lastSeen: now,
      });
    }
  },
});

// Fetch active users in document (seen within last 30s)
export const getPresence = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const allPresence = await ctx.db
      .query("presence")
      .withIndex("by_document", q => q.eq("documentId", args.documentId))
      .collect();

    return allPresence.filter(row => now - row.lastSeen < 30000);
  },
});

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

// Add a public create mutation to resolve frontend error
export const create = mutation({
  args: {
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isArchived: v.optional(v.boolean()),
    isPublished: v.optional(v.boolean()),
    parentDocument: v.optional(v.id("documents")),
    title: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("documents", {
      content: args.content,
      coverImage: args.coverImage,
      icon: args.icon,
      isArchived: args.isArchived ?? false,
      isPublished: args.isPublished ?? false,
      parentDocument: args.parentDocument,
      title: args.title,
      userId: args.userId,
    });
    return id;
  },
});

// Archive a document
export const archive = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) throw new Error("Not found");
    if (existingDocument.userId !== userId) throw new Error("Unauthorized");

    const document = await ctx.db.patch(args.id, {
      isArchived: true,
    });

    return document;
  },
});

// Restore a document
export const restore = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) throw new Error("Not found");
    if (existingDocument.userId !== userId) throw new Error("Unauthorized");

    const document = await ctx.db.patch(args.id, {
      isArchived: false,
    });

    return document;
  },
});

// Remove a document permanently
export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) throw new Error("Not found");
    if (existingDocument.userId !== userId) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});

// Update a document
export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const { id, ...rest } = args;

    const existingDocument = await ctx.db.get(id);
    if (!existingDocument) throw new Error("Not found");
    if (existingDocument.userId !== userId) throw new Error("Unauthorized");

    const document = await ctx.db.patch(id, rest);
    return document;
  },
});

// Remove icon from document
export const removeIcon = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) throw new Error("Not found");
    if (existingDocument.userId !== userId) throw new Error("Unauthorized");

    const document = await ctx.db.patch(args.id, {
      icon: undefined,
    });

    return document;
  },
});

// Remove cover image from document
export const removeCoverImage = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) throw new Error("Not found");
    if (existingDocument.userId !== userId) throw new Error("Unauthorized");

    const document = await ctx.db.patch(args.id, {
      coverImage: undefined,
    });

    return document;
  },
});

// Get document by ID
export const getById = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const document = await ctx.db.get(args.documentId);
    if (!document) return null;

    if (document.isPublished && !document.isArchived) return document;

    const userId = identity.subject;
    if (document.userId !== userId) return null;

    return document;
  },
});

// Get documents for sidebar
export const getSidebar = query({
  args: {
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", userId).eq("parentDocument", args.parentDocument)
      )
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return documents;
  },
});

// Get documents for search
export const getSearch = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return documents;
  },
});

// Get archived documents (trash)
export const getTrash = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .order("desc")
      .collect();

    return documents;
  },
});

// Save translation to database
export const saveTranslation = mutation({
  args: {
    documentId: v.id("documents"),
    targetLang: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const existingDocument = await ctx.db.get(args.documentId);

    if (!existingDocument) throw new Error("Document not found");
    if (existingDocument.userId !== userId) throw new Error("Unauthorized");

    await ctx.db.insert("translatedDocuments", {
      documentId: args.documentId,
      targetLang: args.targetLang,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

// Get translations for a document
export const getTranslations = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const existingDocument = await ctx.db.get(args.documentId);

    if (!existingDocument) return [];
    if (existingDocument.userId !== userId) return [];

    return await ctx.db
      .query("translatedDocuments")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .order("desc")
      .collect();
  },
});
