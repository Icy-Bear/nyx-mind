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

import { ChevronLeft, ChevronRight, Clock, Save, Activity } from "lucide-react";
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
                {member.name}'s Weekly Report
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

                  <div className="text-center">
                    <div className="font-semibold text-lg">
                      {format(weekStart, "MMM d")} -{" "}
                      {format(weekEnd, "MMM d, yyyy")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Week{" "}
                      {Math.ceil(
                        (selectedDate.getDate() - selectedDate.getDay() + 1) / 7
                      )}
                    </div>
                  </div>

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
              </CardContent>
            </Card>

            {/* HOURS + PROJECT + DESCRIPTION */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" /> Daily Logs
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {DAYS.map((day, index) => (
                    <div
                      key={day.key}
                      className="space-y-3 border rounded-lg p-4 bg-muted/30"
                    >
                      {/* Day */}
                      <div className="text-center">
                        <div className="font-medium text-sm">{day.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(weekDates[index], "MMM d")}
                        </div>
                      </div>

                      {/* Hours */}
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => decrementHours(day.key)}
                          disabled={hours[day.key] <= 0}
                        >
                          -
                        </Button>

                        <div className="flex items-center justify-center w-12 h-8 border rounded-md bg-muted/50">
                          <span className="font-mono text-sm font-medium">
                            {hours[day.key]}
                          </span>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => incrementHours(day.key)}
                          disabled={hours[day.key] >= 24}
                        >
                          +
                        </Button>
                      </div>

                      {/* Project Select */}
                      <Select
                        value={projects[day.key]}
                        onValueChange={(v) => updateProject(day.key, v)}
                      >
                        <SelectTrigger>
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

                      {/* Description */}
                      <Textarea
                        placeholder="What did you work on?"
                        value={descriptions[day.key]}
                        onChange={(e) =>
                          updateDescription(day.key, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
