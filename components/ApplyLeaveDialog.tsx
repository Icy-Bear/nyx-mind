"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { applyLeave } from "@/actions/leave";
import { toast } from "sonner";

// Validation schema
const applyLeaveSchema = z
  .object({
    leaveType: z.enum(["CL", "ML"]),
    fromDate: z.date({
      message: "Please select a from date",
    }),
    toDate: z.date({
      message: "Please select a to date",
    }),
    reason: z.string().min(10, "Justification must be at least 10 characters"),
  })
  .refine((data) => data.fromDate <= data.toDate, {
    message: "From date cannot be after to date",
    path: ["fromDate"],
  })
  .refine((data) => data.fromDate >= new Date(new Date().setHours(0, 0, 0, 0)), {
    message: "From date cannot be in the past",
    path: ["fromDate"],
  });

type ApplyLeave = z.infer<typeof applyLeaveSchema>;

interface ApplyLeaveDialogProps {
  onSuccess?: () => void;
}

export function ApplyLeaveDialog({ onSuccess }: ApplyLeaveDialogProps) {
  const [open, setOpen] = React.useState<boolean>(false);
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const form = useForm<ApplyLeave>({
    resolver: zodResolver(applyLeaveSchema),
    defaultValues: {
      leaveType: "CL",
      fromDate: undefined,
      toDate: undefined,
      reason: "",
    },
  });

  async function onSubmit(values: ApplyLeave) {
    try {
      setIsPending(true);
      await applyLeave({
        leaveType: values.leaveType,
        fromDate: new Date(values.fromDate),
        toDate: new Date(values.toDate),
        reason: values.reason,
      });

      toast.success("Leave application submitted successfully");
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to submit leave application");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 shadow-lg hover:scale-105 transition-transform"
        >
          <CalendarPlus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline ml-2">Apply Leave</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogDescription>
          Submit your leave request for review by your manager.
        </DialogDescription>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 pt-4"
          >
            {/* Leave Type */}
            <FormField
              control={form.control}
              name="leaveType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CL">Casual Leave (CL)</SelectItem>
                      <SelectItem value="ML">Medical Leave (ML)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fromDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>From Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarPlus className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>To Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarPlus className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const fromDate = form.getValues("fromDate");
                            return (
                              date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                              (fromDate && date < fromDate)
                            );
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Justification */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justification for Leave</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide a detailed justification for your leave request..."
                      {...field}
                      className="min-h-[100px] resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Leave Policy Info */}
            <div className="bg-muted/30 p-4 rounded-md text-sm text-muted-foreground">
              <p className="font-medium mb-2">Leave Policy</p>
              <ul className="space-y-1 text-xs">
                <li>• Submit requests at least 2 days in advance</li>
                <li>• Medical leave may require documentation</li>
                <li>• Approval is subject to manager discretion</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Spinner className="mr-2 h-4 w-4" />}
              {isPending ? "Submitting..." : "Submit Leave Application"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ApplyLeaveDialog;