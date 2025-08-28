"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Textarea } from "@/components/ui/textarea";

interface EditorProps {
  initialContent?: string;
  documentId: string;
}

export function Editor({ initialContent = "", documentId }: EditorProps) {
  const [content, setContent] = useState(initialContent);
  const update = useMutation(api.documents.update);

  const handleChange = (newContent: string) => {
    setContent(newContent);
    // Update the document in the database
    update({ id: documentId as any, content: newContent });
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <Textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Start writing your document..."
          className="min-h-[500px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
        />
      </div>
    </div>
  );
}
