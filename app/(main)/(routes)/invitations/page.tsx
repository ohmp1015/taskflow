"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle, X, Clock, FileText, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface Invitation {
  _id: string;
  documentId: string;
  invitedEmail: string;
  role: "viewer" | "editor";
  status: "pending" | "accepted" | "declined";
  createdAt: number;
  expiresAt: number;
}

export default function InvitationsPage() {
  const { user } = useUser();
  const router = useRouter();
  
  const acceptInvitation = useMutation(api.documents.acceptInvitation);
  const declineInvitation = useMutation(api.documents.declineInvitation);
  
  // Get invitations for the current user's email
  const invitations = useQuery(
    api.documents.getInvitationsForEmail,
    { email: user?.emailAddresses?.[0]?.emailAddress || "" }
  );

  const handleAccept = async (invitation: Invitation) => {
    if (!user?.id) {
      toast.error("You must be logged in to accept invitations");
      return;
    }

    try {
      await acceptInvitation({
        invitationId: invitation._id as any,
        userId: user.id,
      });
      toast.success("Invitation accepted! You now have access to the document.");
      router.push(`/documents/${invitation.documentId}`);
    } catch (error: any) {
      console.error("Accept invitation error:", error);
      toast.error(error.message || "Failed to accept invitation");
    }
  };

  const handleDecline = async (invitation: Invitation) => {
    try {
      await declineInvitation({
        invitationId: invitation._id as any,
      });
      toast.success("Invitation declined");
    } catch (error: any) {
      console.error("Decline invitation error:", error);
      toast.error("Failed to decline invitation");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "declined":
        return <X className="h-5 w-5 text-red-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "accepted":
        return "Accepted";
      case "declined":
        return "Declined";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  const isExpired = (expiresAt: number) => {
    return Date.now() > expiresAt;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Please log in to view your invitations.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Document Invitations</h1>
        <p className="text-gray-600">
          Manage your document collaboration invitations
        </p>
      </div>

      {!invitations || invitations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No invitations</h3>
            <p className="text-gray-500 text-center">
              You don't have any pending document invitations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation: Invitation) => (
            <Card key={invitation._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(invitation.status)}
                    <div>
                      <CardTitle className="text-lg">
                        Document Collaboration Invitation
                      </CardTitle>
                      <CardDescription>
                        You've been invited to collaborate on a document
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium capitalize">
                      {invitation.role} Access
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(invitation.createdAt)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      Role: <span className="font-medium capitalize">{invitation.role}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      Document ID: <span className="font-mono text-xs">{invitation.documentId}</span>
                    </span>
                  </div>

                  {isExpired(invitation.expiresAt) && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      ⚠️ This invitation has expired
                    </div>
                  )}

                  {invitation.status === "pending" && !isExpired(invitation.expiresAt) && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleAccept(invitation)}
                        className="flex-1"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept Invitation
                      </Button>
                      <Button
                        onClick={() => handleDecline(invitation)}
                        variant="outline"
                        className="flex-1"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  )}

                  {invitation.status !== "pending" && (
                    <div className="text-sm text-gray-600 pt-2">
                      Status: <span className="font-medium">{getStatusText(invitation.status)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
