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

import { ChevronLeft, ChevronRight, Clock, Save, Activity, Edit, CalendarIcon, ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

interface WeeklyReportSheetProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  member: {
    id: string;
    name: string;
    email: string;
    role: string | null;
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

  const [hours, setHours] = useState<Record<string, number>>({
    mon: 4,
    tue: 2,
    wed: 6,
    thu: 3,
    fri: 4,
    sat: 0,
    sun: 0,
  });

  // NEW: Daily project selection state
  const [projects, setProjects] = useState<Record<string, string>>({
    mon: "nivaas",
    tue: "nivaas",
    wed: "nivaas",
    thu: "nivaas",
    fri: "nivaas",
    sat: "nivaas",
    sun: "nivaas",
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

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Set to the start of the week containing the selected date
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      setSelectedDate(weekStart);
      setCalendarOpen(false);
    }
  };

  if (!member) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl p-0 border-l bg-background"
      >
        <SheetHeader className="p-6 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                {member.name}&apos;s Weekly Report
              </SheetTitle>
              <SheetDescription className="text-base text-muted-foreground mt-1">
                {member.email} • {format(weekStart, "MMM d")} -{" "}
                {format(weekEnd, "MMM d, yyyy")}
              </SheetDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              Week{" "}
              {Math.ceil(
                (selectedDate.getDate() - selectedDate.getDay() + 1) / 7
              )}
            </Badge>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* WEEK NAVIGATION */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedDate(
                        new Date(
                          selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000
                        )
                      )
                    }
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>

                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 font-semibold text-lg hover:bg-accent"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        {format(weekStart, "MMM d")} -{" "}
                        {format(weekEnd, "MMM d, yyyy")}
                        <ChevronDownIcon className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                        className="rounded-md border-0"
                      />
                    </PopoverContent>
                  </Popover>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedDate(
                        new Date(
                          selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000
                        )
                      )
                    }
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="text-center mt-2">
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
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" /> Daily Logs
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {DAYS.map((day, index) => (
                    <Button
                      key={day.key}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start gap-2 bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-2 border-dashed border-blue-200 hover:border-blue-300 rounded-xl transition-all duration-200"
                      onClick={() => {
                        setEditingDay(day.key);
                        setDialogOpen(true);
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold text-sm text-blue-700">
                          {day.label}
                        </span>
                        <Edit className="h-3 w-3 text-blue-500" />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(weekDates[index], "MMM d")}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-green-600" />
                        <span className="font-medium text-green-700">
                          {hours[day.key]}h
                        </span>
                      </div>
                      <div className="text-xs text-purple-700 font-medium truncate w-full">
                        {projects[day.key]}
                      </div>
                      <div className="text-xs text-gray-600 truncate w-full">
                        {descriptions[day.key] || "No description"}
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* EDIT DIALOG */}
            {editingDay && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                  <DialogTitle>
                    Edit {DAYS.find(d => d.key === editingDay)?.fullLabel}
                  </DialogTitle>
                  <DialogDescription>
                    Update your hours, project, and description for this day.
                  </DialogDescription>
                  <div className="mt-4">
                    <div className="space-y-4">
                      {/* Hours */}
                      <div>
                        <label className="text-sm font-medium">Hours</label>
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => decrementHours(editingDay)}
                            disabled={hours[editingDay] <= 0}
                          >
                            -
                          </Button>
                          <div className="flex items-center justify-center w-12 h-8 border rounded-md bg-muted/50">
                            <span className="font-mono text-sm font-medium">
                              {hours[editingDay]}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => incrementHours(editingDay)}
                            disabled={hours[editingDay] >= 24}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      {/* Project */}
                      <div>
                        <label className="text-sm font-medium">Project</label>
                        <Select
                          value={projects[editingDay]}
                          onValueChange={(v) => updateProject(editingDay, v)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nivaas">Nivaas</SelectItem>
                            <SelectItem value="tdc">TDC Community</SelectItem>
                            <SelectItem value="mithayadarpan">
                              MithayaDarpan
                            </SelectItem>
                            <SelectItem value="android-app">
                              Android Attendance System
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          placeholder="What did you work on?"
                          value={descriptions[editingDay]}
                          onChange={(e) =>
                            updateDescription(editingDay, e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-muted/30">
          <Button className="w-full text-lg py-6" size="lg">
            <Save className="h-5 w-5 mr-2" /> Save Weekly Report
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
