// Usage of chat component in document page
import { ChatToDoc } from "@/components/document/chat-to-doc";

export default function DocumentPage({ params }: { params: { id: string } }) {
  // For demonstration, assume doc is fetched here with content and _id
  const doc = {
    content: "Sample document content for chat",
    _id: params.id,
  };

  return <ChatToDoc content={doc.content} documentId={doc._id} />;
}
