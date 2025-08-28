"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Share2, User } from "lucide-react";

interface ShareAccessProps {
  documentId: string;
  invitedBy: string;
}

export function ShareAccess({ documentId, invitedBy }: ShareAccessProps) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("editor");
  const grantAccess = useMutation(api.documents.grantAccess);

  const handleShare = async () => {
    if (!userId.trim()) {
      toast.error("User ID is required");
      return;
    }

    try {
      await grantAccess({ 
        documentId: documentId as any, 
        userId: userId.trim(), 
        role, 
        invitedBy 
      });
      toast.success("Access granted successfully");
      setUserId("");
    } catch (error: any) {
      console.error("Share access error:", error);
      toast.error(error.message || "Failed to grant access");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border">
      <div className="flex items-center gap-2 mb-3">
        <Share2 className="h-4 w-4 text-gray-600" />
        <h3 className="text-sm font-medium">Share Document</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="flex-1"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "viewer" | "editor")}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
        </div>
        
        <Button 
          onClick={handleShare}
          disabled={!userId.trim()}
          size="sm"
          className="w-full"
        >
          <User className="h-4 w-4 mr-2" />
          Grant Access
        </Button>
      </div>
    </div>
  );
}
