"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lock, Mail } from "lucide-react";

interface RequestAccessProps {
  documentId: string;
}

export function RequestAccess({ documentId }: RequestAccessProps) {
  const { user } = useUser();
  const request = useMutation(api.documents.requestAccess);

  const handleRequest = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to request access");
      return;
    }

    try {
      await request({ 
        documentId, 
        userId: user.id,
        reason: "User requested access to document"
      });
      toast.success("Access request sent successfully");
    } catch (error: any) {
      console.error("Request access error:", error);
      toast.error("Failed to send access request");
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4 p-8">
        <Lock className="h-16 w-16 text-gray-400 mx-auto" />
        <h2 className="text-2xl font-semibold text-gray-900">
          Access Required
        </h2>
        <p className="text-gray-600 max-w-md">
          You don't have access to this document. Request access from the document owner to view and collaborate.
        </p>
        <Button 
          onClick={handleRequest}
          className="flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          Request Access
        </Button>
      </div>
    </div>
  );
}
