"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionDialogProps {
  title: string;
  description?: string;
  label: string;
  icon?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ActionDialog({
  title,
  description,
  label,
  icon,
  className,
  size = "md",
  children,
  open,
  onOpenChange,
}: ActionDialogProps) {
  // Dynamic sizes
  const sizes = {
    sm: "sm:max-w-[400px]",
    md: "sm:max-w-[500px]",
    lg: "sm:max-w-[650px]",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className={cn("flex items-center gap-2", className)}>
          {icon}
          <span>{label}</span>
        </Button>
      </DialogTrigger>

      <DialogContent
        className={cn("max-h-[90vh] overflow-y-auto", sizes[size])}
      >
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}

        <div className="mt-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
