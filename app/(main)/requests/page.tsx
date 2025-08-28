"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

// Page showing pending access requests to the owner
export default function AccessRequestsPage() {
  const { user } = useUser();
  if (!user) return null;
  const requests = useQuery(api.documents.getAccessRequestsForOwner, {
    ownerId: user.id,
  });
  const grant = useMutation(api.documents.grantAccess);
  const remove = useMutation(api.documents.deleteAccessRequest);

  // Approve a request
  const approve = async (req: { _id: string; documentId: string; userId: string }) => {
    await grant({
      documentId: req.documentId,
      userId: req.userId,
      role: "editor",
      invitedBy: user.id,
    });
    await remove({ requestId: req._id });
    toast.success("Access granted");
  };

  if (!requests) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Access Requests</h1>
      {requests.map((r) => (
        <div
          key={r._id}
          className="flex items-center justify-between border p-3 mb-2 rounded"
        >
          <div>
            <p className="font-medium">User: {r.userId}</p>
            <p className="text-sm text-gray-500">Document ID: {r.documentId}</p>
          </div>
          <Button onClick={() => approve(r)}>Approve</Button>
        </div>
      ))}
    </div>
  );
}
