"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props {
  documentId: string;
}

export function DocumentPresenceAvatars({ documentId }: Props) {
  const { user } = useUser();
  const updatePresence = useMutation(api.documents.updatePresence);

  // Query to get currently present users
  const users = useQuery(api.documents.getPresence, { documentId });

  // Update presence every 10s
  useEffect(() => {
    if (!user?.id || !user.fullName) return;

    const interval = setInterval(() => {
      updatePresence({
        documentId: documentId as any,
        userId: user.id,
        name: user.fullName || "Unknown User",
        avatarUrl: user.imageUrl,
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [user?.id, user?.fullName, user?.imageUrl, documentId, updatePresence]);

  if (!users || users.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 flex -space-x-3 z-50">
      {users.map((u) => (
        <div key={u.userId} title={u.name}>
          <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
            <AvatarImage src={u.avatarUrl} alt={u.name} />
            <AvatarFallback>
              {u.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      ))}
    </div>
  );
}
