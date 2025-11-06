"use client";

import { Button } from "@/components/ui/button";
import { List, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("grid")}
        className={cn(
          "h-8 w-8 p-0",
          viewMode === "grid"
            ? "bg-blue-600 text-white shadow-sm"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        )}
      >
        <Grid3X3 className="h-4 w-4" />
        <span className="sr-only">Grid view</span>
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("list")}
        className={cn(
          "h-8 w-8 p-0",
          viewMode === "list"
            ? "bg-blue-600 text-white shadow-sm"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        )}
      >
        <List className="h-4 w-4" />
        <span className="sr-only">List view</span>
      </Button>
    </div>
  );
}

export default ViewToggle;