"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2 } from "lucide-react";
import { HoursInput } from "./HoursInput";

interface DayInfo {
  key: string;
  label: string;
  fullLabel: string;
}

interface DayEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: DayInfo | null;
  hours: number;
  project: string;
  description: string;
  onHoursChange: (hours: number) => void;
  onProjectChange: (project: string) => void;
  onDescriptionChange: (description: string) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  userProjects: Array<{ id: string; projectName: string }>;
  currentProjectId?: string;
  currentProjectName?: string;
}

export function DayEditDialog({
  open,
  onOpenChange,
  day,
  hours,
  description,
  onHoursChange,
  onDescriptionChange,
  onSave,
  isSaving,
}: DayEditDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
      }}
    >
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogTitle className="text-lg sm:text-xl">
          Edit {day?.fullLabel}
        </DialogTitle>
        <DialogDescription className="text-sm sm:text-base">
          Update your hours, project, and description for this day.
        </DialogDescription>
        <div className="mt-4 sm:mt-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Hours */}
            <div>
              <label className="text-sm font-medium block mb-2">Hours</label>
              <HoursInput
                value={hours}
                onChange={onHoursChange}
                min={0}
                max={24}
                disabled={isSaving}
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium block mb-2">
                Description
              </label>
              <Textarea
                placeholder="What did you work on?"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                className="mt-0 min-h-[80px] sm:min-h-[100px] resize-none"
                disabled={isSaving}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? "Saving..." : "Save Day"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
