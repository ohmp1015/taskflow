"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Users, X, CheckCircle, Clock } from "lucide-react";

interface InviteTeamMemberProps {
  documentId: Id<"documents">;
}

interface Invitation {
  _id: string;
  invitedEmail: string;
  role: "viewer" | "editor";
  status: "pending" | "accepted" | "declined";
  createdAt: number;
  expiresAt: number;
}

export function InviteTeamMember({ documentId }: InviteTeamMemberProps) {
  const { user } = useUser();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [isInviting, setIsInviting] = useState(false);

  // Convex mutations and queries
  const createInvitation = useMutation(api.documents.createInvitation);
  const deleteInvitation = useMutation(api.documents.deleteInvitation);
  const invitations = useQuery(api.documents.getInvitationsForDocument, { documentId });

  const handleInvite = async () => {
    if (!email.trim() || !user?.id) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsInviting(true);
    try {
      await createInvitation({
        documentId,
        invitedEmail: email.trim(),
        role,
        invitedBy: user.id,
      });

      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      setRole("viewer");
    } catch (error: any) {
      console.error("Invitation error:", error);
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    try {
      await deleteInvitation({ invitationId: invitationId as Id<"invitations"> });
      toast.success("Invitation deleted");
    } catch (error: any) {
      console.error("Delete invitation error:", error);
      toast.error("Failed to delete invitation");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "declined":
        return <X className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
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

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Invite Team Members
        </CardTitle>
        <CardDescription>
          Invite people to collaborate on this document
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Invite form */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Select value={role} onValueChange={(value: "viewer" | "editor") => setRole(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleInvite}
            disabled={isInviting || !email.trim()}
            className="w-full"
          >
            {isInviting ? (
              <>
                <Mail className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>
        </div>

        {/* Invitations list */}
        {invitations && invitations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Pending Invitations</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {invitations.map((invitation: Invitation) => (
                <div
                  key={invitation._id}
                  className={`flex items-center justify-between p-2 rounded-md border ${
                    isExpired(invitation.expiresAt) ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(invitation.status)}
                      <span className="text-sm font-medium truncate">
                        {invitation.invitedEmail}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="capitalize">{invitation.role}</span>
                      <span>•</span>
                      <span>{getStatusText(invitation.status)}</span>
                      {isExpired(invitation.expiresAt) && (
                        <>
                          <span>•</span>
                          <span className="text-red-500">Expired</span>
                        </>
                      )}
                    </div>
                  </div>
                  {invitation.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteInvitation(invitation._id)}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
