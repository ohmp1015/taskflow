"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ItemProps {
  id?: string;
  title?: string;
  icon: LucideIcon;
  documentIcon?: string;
  isSearch?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export const Item = ({
  id,
  title,
  icon: Icon,
  documentIcon,
  isSearch,
  isActive,
  onClick,
}: ItemProps) => {
  return (
    <div
      onClick={onClick}
      role="button"
      className={cn(
        "group p-3 w-full hover:bg-primary/5 flex items-center text-sm font-medium",
        isActive && "bg-primary/5 text-primary"
      )}
    >
      {documentIcon ? (
        <div className="shrink-0 h-[18px] w-[18px] mr-2 text-muted-foreground">
          {documentIcon}
        </div>
      ) : (
        <Icon className="shrink-0 h-[18px] w-[18px] mr-2 text-muted-foreground" />
      )}
      <span className="truncate">{title || "Untitled"}</span>
    </div>
  );
};
