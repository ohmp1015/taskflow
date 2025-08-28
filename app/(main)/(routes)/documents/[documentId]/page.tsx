"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/spinner";
import { Editor } from "@/components/editor";
import { ChatToDoc } from "@/components/document/chat-to-doc";
import { TranslateButton } from "@/components/document/translate-button";
import { InviteTeamMember } from "@/components/document/invite-team-member";
import { RequestAccess } from "@/components/document/request-access";
import { ShareAccess } from "@/components/document/share-access";
import { DocumentPresenceAvatars } from "@/components/document/presence-avatars";

export default function DocumentEditorPage({ params }: { params: { documentId: string } }) {
  const { user } = useUser();
  const router = useRouter();
  const documentId = params.documentId;

  const doc = useQuery(api.documents.getDocumentWithAccessCheck, {
    documentId,
    userId: user?.id || "",
  });

  // Loading state
  if (doc === undefined) return <Spinner />;
  // If no access, show request button
  if (!doc) return <RequestAccess documentId={documentId} />;

  return (
    <div className="relative h-full">
      {/* Show live avatars */}
      <DocumentPresenceAvatars documentId={documentId} />

      {/* Share document access */}
      <div className="absolute top-4 left-4 z-10">
        <ShareAccess documentId={documentId} invitedBy={user?.id || ""} />
      </div>

      {/* Invite team members */}
      <div className="absolute top-4 left-80 z-10">
        <InviteTeamMember documentId={documentId} />
      </div>

      {/* Main editor */}
      <Editor initialContent={doc.content} documentId={documentId} />

      {/* Chat and translation components */}
      <div className="fixed bottom-4 right-4 z-10 space-y-4">
        <ChatToDoc content={doc.content} documentId={documentId} />
        <TranslateButton content={doc.content} />
      </div>
    </div>
  );
}
