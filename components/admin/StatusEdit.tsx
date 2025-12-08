"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { updateProjectStatus } from "@/actions/projects";
import { projectStatusEnum } from "@/db/schema/project-schema";

interface StatusEditProps {
  projectId: string;
  currentStatus: string;
  onStatusUpdated?: () => void;
}

const statusOptions = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function StatusEdit({ projectId, currentStatus, onStatusUpdated }: StatusEditProps) {
  const [open, setOpen] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState(currentStatus);

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      await updateProjectStatus(projectId, newStatus as typeof projectStatusEnum.enumValues[number]);
      toast.success("Project status updated successfully");
      setSelectedStatus(newStatus);
      setOpen(false);
      onStatusUpdated?.();
    } catch (error) {
      console.error("Error updating project status:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update project status");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "not_started":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "in_progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "on_hold":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Project Status</DialogTitle>
          <DialogDescription>
            Change the status of this project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Status</label>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(currentStatus)}>
                {statusOptions.find(opt => opt.value === currentStatus)?.label || "Unknown"}
              </Badge>
              <span className="text-sm text-muted-foreground">→</span>
              <Badge className={getStatusColor(selectedStatus)}>
                {statusOptions.find(opt => opt.value === selectedStatus)?.label || "Unknown"}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">New Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={() => handleStatusChange(selectedStatus)} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Status"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}