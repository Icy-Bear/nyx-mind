// Updated WeeklyReportSheet with project dropdown and daily description
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Save,
  Activity,
  Edit,
  CalendarIcon,
  ChevronDownIcon,
  Loader2,
  CheckSquare,
  Square,
} from "lucide-react";
import { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { getWeeklyReport, saveDailyEntry } from "@/actions/weekly-reports";

// Day mapping constant (matches database values)
const DAY_MAPPING = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 0,
};
import { getProjects } from "@/actions/projects";
import { toast } from "sonner";

interface WeeklyReportSheetProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  member: {
    id: string;
    name: string;
    email: string;
    role: string | null;
    createdAt: Date;
  } | null;
}

export function WeeklyReportSheet({
  open,
  onOpenChange,
  member,
}: WeeklyReportSheetProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userProjects, setUserProjects] = useState<
    Array<{ id: string; projectName: string }>
  >([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [quickProject, setQuickProject] = useState<string>("none");

  // Ensure selected date is not before user's joined date
  useEffect(() => {
    if (member?.createdAt && selectedDate) {
      const joinedWeek = startOfWeek(new Date(member.createdAt), {
        weekStartsOn: 1,
      });
      const currentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });

      if (currentWeek < joinedWeek) {
        setSelectedDate(joinedWeek);
      }
    }
  }, [member, selectedDate]);

  // Load user projects when member changes
  useEffect(() => {
    const loadUserProjects = async () => {
      if (!member) return;

      try {
        const projects = await getProjects(member.id);
        setUserProjects(
          projects.map((p) => ({ id: p.id, projectName: p.projectName }))
        );
      } catch (error) {
        console.error("Error loading user projects:", error);
        toast.error("Failed to load user projects");
        // Set empty projects if fetch fails
        setUserProjects([]);
      }
    };

    loadUserProjects();
  }, [member]);

  // Load weekly report data when week changes
  useEffect(() => {
    const loadWeeklyReport = async () => {
      if (!member) return;

      setIsLoading(true);
      try {
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const report = await getWeeklyReport(weekStart, member.id);

        if (report) {
          setHours(report.hours);
          setProjects(report.projects);
          setDescriptions(report.descriptions);
        } else {
          // Reset to defaults for new week
          setHours({
            mon: 0,
            tue: 0,
            wed: 0,
            thu: 0,
            fri: 0,
            sat: 0,
            sun: 0,
          });
          // Set default project to "none" (no project selected)
          setProjects({
            mon: "none",
            tue: "none",
            wed: "none",
            thu: "none",
            fri: "none",
            sat: "none",
            sun: "none",
          });
          setDescriptions({
            mon: "",
            tue: "",
            wed: "",
            thu: "",
            fri: "",
            sat: "",
            sun: "",
          });
        }
      } catch (error) {
        console.error("Error loading weekly report:", error);
        toast.error("Failed to load weekly report");
      } finally {
        setIsLoading(false);
      }
    };

    loadWeeklyReport();
  }, [selectedDate, member, userProjects]);

  const [hours, setHours] = useState<Record<string, number>>({
    mon: 0,
    tue: 0,
    wed: 0,
    thu: 0,
    fri: 0,
    sat: 0,
    sun: 0,
  });

  // NEW: Daily project selection state
  const [projects, setProjects] = useState<Record<string, string>>({
    mon: "none",
    tue: "none",
    wed: "none",
    thu: "none",
    fri: "none",
    sat: "none",
    sun: "none",
  });

  const updateProject = (dayKey: string, value: string) => {
    setProjects((prev) => ({
      ...prev,
      [dayKey]: value,
    }));
  };

  const [descriptions, setDescriptions] = useState<Record<string, string>>({
    mon: "",
    tue: "",
    wed: "",
    thu: "",
    fri: "",
    sat: "",
    sun: "",
  });

  const DAYS = [
    { key: "mon", label: "Mon", fullLabel: "Monday" },
    { key: "tue", label: "Tue", fullLabel: "Tuesday" },
    { key: "wed", label: "Wed", fullLabel: "Wednesday" },
    { key: "thu", label: "Thu", fullLabel: "Thursday" },
    { key: "fri", label: "Fri", fullLabel: "Friday" },
    { key: "sat", label: "Sat", fullLabel: "Saturday" },
    { key: "sun", label: "Sun", fullLabel: "Sunday" },
  ];

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDates = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Calculate the earliest allowed week (user's joined week)
  const earliestAllowedWeek = member?.createdAt
    ? startOfWeek(new Date(member.createdAt), { weekStartsOn: 1 })
    : null;

  const updateHours = (dayKey: string, value: number) => {
    setHours((prev) => ({
      ...prev,
      [dayKey]: Math.max(0, Math.min(24, value)),
    }));
  };

  const incrementHours = (dayKey: string) =>
    updateHours(dayKey, hours[dayKey] + 1);
  const decrementHours = (dayKey: string) =>
    updateHours(dayKey, hours[dayKey] - 1);

  const updateDescription = (dayKey: string, text: string) => {
    setDescriptions((prev) => ({ ...prev, [dayKey]: text }));
  };

  const toggleDaySelection = (dayKey: string) => {
    setSelectedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dayKey)) {
        newSet.delete(dayKey);
      } else {
        newSet.add(dayKey);
      }
      return newSet;
    });
  };

  const getProjectColor = (projectId: string) => {
    if (projectId === "none")
      return "bg-gray-100 text-gray-700 border-gray-200";
    const colors = [
      "bg-blue-100 text-blue-700 border-blue-200",
      "bg-green-100 text-green-700 border-green-200",
      "bg-purple-100 text-purple-700 border-purple-200",
      "bg-orange-100 text-orange-700 border-orange-200",
      "bg-pink-100 text-pink-700 border-pink-200",
      "bg-indigo-100 text-indigo-700 border-indigo-200",
      "bg-teal-100 text-teal-700 border-teal-200",
      "bg-yellow-100 text-yellow-700 border-yellow-200",
    ];
    const index =
      projectId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Set to the start of the week containing the selected date
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      setSelectedDate(weekStart);
      setCalendarOpen(false);
    }
  };

  const getWeekOfMonth = (date: Date) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    return Math.ceil((dayOfMonth + startOfMonth.getDay() - 1) / 7);
  };

  const handleSaveDay = async () => {
    if (!editingDay) return;

    setIsSaving(true);
    try {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      // Use DAY_MAPPING to get correct day number (mon=1, tue=2, ..., sun=0)
      const dayOfWeek = DAY_MAPPING[editingDay as keyof typeof DAY_MAPPING];

      await saveDailyEntry({
        weekStartDate: weekStart,
        dayOfWeek,
        hours: hours[editingDay],
        projectName:
          projects[editingDay] === "none" ? "" : projects[editingDay],
        description: descriptions[editingDay] || "",
      });

      toast.success("Day saved successfully!");
      setDialogOpen(false);
      setEditingDay(null);
    } catch (error) {
      console.error("Error saving day:", error);
      toast.error("Failed to save day");
    } finally {
      setIsSaving(false);
    }
  };

  if (!member) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl p-0 border-l bg-background"
      >
        <SheetHeader className="p-4 sm:p-6 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="truncate">
                  {member.name}&apos;s Weekly Report
                </span>
              </SheetTitle>
              <SheetDescription className="text-sm sm:text-base text-muted-foreground mt-1">
                <span className="truncate block sm:inline">{member.email}</span>
                <span className="hidden sm:inline"> • </span>
                <span className="block sm:inline">
                  {format(weekStart, "MMM d")} -{" "}
                  {format(weekEnd, "MMM d, yyyy")}
                </span>
              </SheetDescription>
            </div>
            <Badge
              variant="secondary"
              className="text-sm self-start sm:self-center shrink-0"
            >
              Week{" "}
              {Math.ceil(
                (selectedDate.getDate() - selectedDate.getDay() + 1) / 7
              )}
            </Badge>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* WEEK NAVIGATION */}
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={
                      earliestAllowedWeek
                        ? weekStart <= earliestAllowedWeek
                        : false
                    }
                    onClick={() =>
                      setSelectedDate(
                        new Date(
                          selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000
                        )
                      )
                    }
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </Button>

                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 font-semibold text-base sm:text-lg hover:bg-accent w-full sm:w-auto justify-center"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        <span className="truncate">
                          {format(weekStart, "MMM d")} -{" "}
                          {format(weekEnd, "MMM d, yyyy")}
                        </span>
                        <ChevronDownIcon className="h-4 w-4 opacity-50 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="center"
                      side="bottom"
                    >
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                        className="rounded-md border-0"
                        disabled={(date) => {
                          if (!member?.createdAt) return false;
                          // Disable dates before the user's joined date
                          return date < new Date(member.createdAt);
                        }}
                        modifiers={{
                          week1: (date) => getWeekOfMonth(date) === 1,
                          week2: (date) => getWeekOfMonth(date) === 2,
                          week3: (date) => getWeekOfMonth(date) === 3,
                          week4: (date) => getWeekOfMonth(date) === 4,
                        }}
                        modifiersClassNames={{
                          week1: "bg-blue-50 hover:bg-blue-100 text-blue-700",
                          week2:
                            "bg-green-50 hover:bg-green-100 text-green-700",
                          week3:
                            "bg-yellow-50 hover:bg-yellow-100 text-yellow-700",
                          week4:
                            "bg-purple-50 hover:bg-purple-100 text-purple-700",
                        }}
                      />
                      <div className="p-3 border-t bg-muted/30">
                        <div className="text-xs font-medium text-muted-foreground mb-2 text-center">
                          Week Colors
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
                            <span>Week 1</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
                            <span>Week 2</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200"></div>
                            <span>Week 3</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-purple-100 border border-purple-200"></div>
                            <span>Week 4</span>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() =>
                      setSelectedDate(
                        new Date(
                          selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000
                        )
                      )
                    }
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="text-center mt-2 sm:mt-2">
                  <div className="text-sm text-muted-foreground">
                    Week{" "}
                    {Math.ceil(
                      (selectedDate.getDate() - selectedDate.getDay() + 1) / 7
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DAILY BADGES */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" /> Daily Logs
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0">
                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Loading...
                    </span>
                  </div>
                )}
                <div
                  className={`grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 ${
                    isLoading ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  {DAYS.map((day, index) => {
                    const dayDate = weekDates[index];
                    const isBeforeJoinedDate = member?.createdAt
                      ? dayDate < new Date(member.createdAt)
                      : false;

                    return (
                      <Button
                        key={day.key}
                        variant="outline"
                        className={`h-auto p-3 sm:p-4 flex flex-col items-start gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl transition-all duration-200 ${
                          isBeforeJoinedDate
                            ? "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed"
                            : selectedDays.has(day.key)
                            ? "bg-blue-100 border-blue-300 ring-2 ring-blue-200"
                            : bulkMode
                            ? "bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-2 border-dashed border-gray-300 hover:border-gray-400"
                            : "bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-2 border-dashed border-blue-200 hover:border-blue-300"
                        }`}
                        onClick={() => {
                          if (isBeforeJoinedDate || isLoading) return;
                          if (bulkMode) {
                            toggleDaySelection(day.key);
                          } else {
                            setEditingDay(day.key);
                            setDialogOpen(true);
                          }
                        }}
                        disabled={isLoading || isBeforeJoinedDate}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-semibold text-sm text-blue-700">
                            {day.label}
                          </span>
                          {bulkMode ? (
                            <div
                              className={`h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center ${
                                selectedDays.has(day.key)
                                  ? "bg-blue-500 border-blue-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedDays.has(day.key) && (
                                <CheckSquare className="h-3 w-3 text-white" />
                              )}
                            </div>
                          ) : (
                            <Edit className="h-3 w-3 text-blue-500 shrink-0" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(weekDates[index], "MMM d")}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-green-600 shrink-0" />
                          <span className="font-medium text-green-700">
                            {hours[day.key]}h
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {projects[day.key] && projects[day.key] !== "none" ? (
                            <Badge
                              variant="secondary"
                              className={`text-xs px-1.5 py-0.5 border ${getProjectColor(
                                projects[day.key]
                              )}`}
                            >
                              {userProjects.find(
                                (p) => p.id === projects[day.key]
                              )?.projectName || projects[day.key]}
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-500">
                              No project
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 truncate w-full min-w-0">
                          {descriptions[day.key] || "No description"}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* EDIT DIALOG */}
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingDay(null);
          }}
        >
          <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogTitle className="text-lg sm:text-xl">
              Edit {DAYS.find((d) => d.key === editingDay)?.fullLabel}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Update your hours, project, and description for this day.
            </DialogDescription>
            <div className="mt-4 sm:mt-6">
              <div className="space-y-4 sm:space-y-6">
                {/* Hours */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Hours
                  </label>
                  <div className="flex items-center justify-center gap-3 sm:gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 sm:h-8 sm:w-8 p-0 shrink-0"
                      onClick={() => editingDay && decrementHours(editingDay)}
                      disabled={!editingDay || hours[editingDay] <= 0}
                    >
                      -
                    </Button>
                    <div className="flex items-center justify-center w-14 sm:w-12 h-9 sm:h-8 border rounded-md bg-muted/50 min-w-[3.5rem] sm:min-w-[3rem]">
                      <span className="font-mono text-sm sm:text-sm font-medium">
                        {editingDay ? hours[editingDay] : 0}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 sm:h-8 sm:w-8 p-0 shrink-0"
                      onClick={() => editingDay && incrementHours(editingDay)}
                      disabled={!editingDay || hours[editingDay] >= 24}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Project */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Project
                  </label>
                  <Select
                    value={
                      editingDay
                        ? projects[editingDay] || userProjects[0]?.id
                        : userProjects[0]?.id
                    }
                    onValueChange={(v) =>
                      editingDay && updateProject(editingDay, v)
                    }
                  >
                    <SelectTrigger className="mt-0 h-10 sm:h-9">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="none">No project</SelectItem>
                      {userProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.projectName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Description
                  </label>
                  <Textarea
                    placeholder="What did you work on?"
                    value={editingDay ? descriptions[editingDay] : ""}
                    onChange={(e) =>
                      editingDay &&
                      updateDescription(editingDay, e.target.value)
                    }
                    className="mt-0 min-h-[80px] sm:min-h-[100px] resize-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveDay} disabled={isSaving}>
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
      </SheetContent>
    </Sheet>
  );
}
