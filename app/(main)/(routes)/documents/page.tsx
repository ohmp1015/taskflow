"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";

export default function DocumentsPage() {
  const { user } = useUser();
  const router = useRouter();
  const documents = useQuery(api.documents.getSidebar);

  const handleCreate = () => {
    if (!user?.id) return;
    
    const promise = documents?.create({
      title: "Untitled",
      userId: user.id,
    });

    if (promise) {
      promise.then((documentId) => {
        router.push(`/documents/${documentId}`);
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Documents</h1>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Document
        </Button>
      </div>

      {!documents || documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No documents yet</h3>
          <p className="text-gray-500 mb-4">
            Create your first document to get started
          </p>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Document
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <div
              key={doc._id}
              onClick={() => router.push(`/documents/${doc._id}`)}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <h3 className="font-medium truncate">{doc.title}</h3>
              </div>
              <p className="text-sm text-gray-500">
                {doc.content ? `${doc.content.substring(0, 100)}...` : "No content"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
