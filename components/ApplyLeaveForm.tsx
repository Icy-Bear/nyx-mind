"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";


import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, FileText } from "lucide-react";

import { applyLeave } from "@/actions/leave";
import { toast } from "sonner";

// Validation schema
const applyLeaveSchema = z
  .object({
    leaveType: z.enum(["CL", "ML"]),
    fromDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
    toDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
    reason: z.string().min(10, "Justification must be at least 10 characters"),
  })
  .refine((data) => new Date(data.fromDate) <= new Date(data.toDate), {
    message: "From date cannot be after to date",
    path: ["fromDate"],
  })
  .refine((data) => new Date(data.fromDate) >= new Date(), {
    message: "From date cannot be in the past",
    path: ["fromDate"],
  });

type ApplyLeave = z.infer<typeof applyLeaveSchema>;

interface ApplyLeaveFormProps {
  onSuccess?: () => void;
}

export function ApplyLeaveForm({ onSuccess }: ApplyLeaveFormProps) {
  const [isPending, setIsPending] = useState<boolean>(false);

  const form = useForm<ApplyLeave>({
    resolver: zodResolver(applyLeaveSchema),
    defaultValues: {
      leaveType: "CL",
      fromDate: "",
      toDate: "",
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Leave Type */}
            <FormField
              control={form.control}
              name="leaveType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Leave Type
                  </FormLabel>
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
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      From Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Justification */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justification for Leave</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Please provide a detailed justification for your leave request..."
                      {...field}
                      className="min-h-[44px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Info Card */}
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Leave Policy</p>
                    <p className="text-xs text-muted-foreground">
                      • Submit requests at least 2 days in advance
                    </p>
                    <p className="text-xs text-muted-foreground">
                      • Medical leave may require documentation and proper justification
                    </p>
                    <p className="text-xs text-muted-foreground">
                      • Approval is subject to manager discretion
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button 
            type="submit" 
            className="w-full sm:w-auto" 
            disabled={isPending}
          >
            {isPending && <Spinner className="mr-2 h-4 w-4" />}
            {isPending ? "Submitting..." : "Submit Leave Application"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => form.reset()}
          >
            Clear Form
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default ApplyLeaveForm;