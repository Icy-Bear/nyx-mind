"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, Edit, TrendingUp, TrendingDown } from "lucide-react";
import { setTargetHours } from "@/actions/weekly-reports";
import { toast } from "sonner";
import { startOfWeek } from "date-fns";

interface TargetHoursProgressProps {
  member: {
    id: string;
    name: string;
    email: string;
    role: string | null;
    createdAt: Date;
  } | null;
  targetHours: number;
  actualHours: number;
  selectedDate: Date;
  isCurrentUserAdmin: boolean;
  onTargetHoursUpdated?: () => void;
  projectId?: string;
}

export function TargetHoursProgress({
  member,
  targetHours,
  actualHours,
  selectedDate,
  isCurrentUserAdmin,
  onTargetHoursUpdated,
  projectId,
}: TargetHoursProgressProps) {
  const [isSettingTarget, setIsSettingTarget] = useState(false);
  const [targetDialogOpen, setTargetDialogOpen] = useState(false);
  const [newTargetHours, setNewTargetHours] = useState(targetHours.toString());

  const progressPercentage = targetHours > 0 ? Math.min((actualHours / targetHours) * 100, 100) : 0;
  const remainingHours = Math.max(targetHours - actualHours, 0);
  const isOverTarget = actualHours > targetHours;

  const handleSetTargetHours = async () => {
    if (!member) return;

    try {
      setIsSettingTarget(true);
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });

      await setTargetHours({
        userId: member.id,
        weekStartDate: weekStart,
        targetHours: parseFloat(newTargetHours) || 40,
        projectId,
      });

      toast.success("Target hours updated successfully");
      setTargetDialogOpen(false);
      onTargetHoursUpdated?.();
    } catch (error) {
      console.error("Error setting target hours:", error);
      toast.error("Failed to set target hours");
    } finally {
      setIsSettingTarget(false);
    }
  };

  const openTargetDialog = () => {
    setNewTargetHours(targetHours.toString());
    setTargetDialogOpen(true);
  };

  return (
    <>
      <div className="bg-muted/50 rounded-lg p-4 space-y-4">
        {/* Target Hours Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-semibold">Weekly Target</span>
            <Badge variant="outline" className="text-sm">
              {targetHours}h
            </Badge>
          </div>

          {isCurrentUserAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={openTargetDialog}
              className="h-8 px-2"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
        </div>

        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Progress:</span>
              <span className="text-muted-foreground">
                {actualHours.toFixed(1)}h / {targetHours}h
              </span>
            </div>
            <div className="flex items-center gap-1">
              {isOverTarget ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-orange-600" />
              )}
              <span className={`font-medium text-sm ${isOverTarget ? 'text-green-600' : 'text-orange-600'}`}>
                {progressPercentage.toFixed(0)}%
              </span>
            </div>
          </div>

          <Progress
            value={progressPercentage}
            className="h-3"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Status</span>
            <span>
              {isOverTarget
                ? `${(actualHours - targetHours).toFixed(1)}h over target`
                : `${remainingHours.toFixed(1)}h remaining`
              }
            </span>
          </div>
        </div>
      </div>

      {/* Set Target Hours Dialog */}
      <Dialog open={targetDialogOpen} onOpenChange={setTargetDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Set Target Hours</DialogTitle>
            <DialogDescription>
              Set the target number of hours for <strong>{member?.name}</strong> for the week of{" "}
              {startOfWeek(selectedDate, { weekStartsOn: 1 }).toLocaleDateString()}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Hours</label>
              <Input
                type="number"
                min="0"
                max="168"
                step="0.5"
                value={newTargetHours}
                onChange={(e) => setNewTargetHours(e.target.value)}
                placeholder="40"
              />
              <p className="text-xs text-muted-foreground">
                Enter the target number of hours for this week (0-168 hours)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTargetDialogOpen(false)}
              disabled={isSettingTarget}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSetTargetHours}
              disabled={isSettingTarget}
            >
              {isSettingTarget ? "Setting..." : "Set Target"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}