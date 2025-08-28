"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Item } from "./item";
import { Button } from "@/components/ui/button";
import { Plus, Search, Settings, FileText, Users } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { useSearch } from "@/hooks/use-search";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const settings = useSettings();
  const search = useSearch();
  const documents = useQuery(api.documents.getSidebar);

  const onCreate = () => {
    const promise = documents?.create({
      title: "Untitled",
      userId: user?.id!,
    });

    // toast.promise(promise, {
    //   loading: "Creating a new note...",
    //   success: "New note created!",
    //   error: "Failed to create a new note."
    // });
  };

  return (
    <aside className="group/sidebar h-full bg-secondary overflow-y-auto relative flex w-60 flex-col z-[99999]">
      <div>
        <Item
          onClick={search.onOpen}
          icon={Search}
          label="Search"
          isSearch
        />
        <Item
          onClick={settings.onOpen}
          icon={Settings}
          label="Settings"
        />
        <Item
          onClick={() => router.push("/invitations")}
          icon={Users}
          label="Invitations"
          isActive={pathname === "/invitations"}
        />
      </div>
      <div className="mt-4">
        <Item
          onClick={onCreate}
          icon={Plus}
          label="New page"
        />
        {documents?.map((document) => (
          <div
            key={document._id}
            onClick={() => router.push(`/documents/${document._id}`)}
          >
            <Item
              id={document._id}
              title={document.title}
              icon={FileText}
              documentIcon={document.icon}
              isActive={pathname === `/documents/${document._id}`}
            />
          </div>
        ))}
      </div>
    </aside>
  );
};
