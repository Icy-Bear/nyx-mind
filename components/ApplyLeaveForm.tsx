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
    reason: z.string().min(10, "Reason must be at least 10 characters"),
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
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

        {/* From Date */}
        <FormField
          control={form.control}
          name="fromDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>From Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* To Date */}
        <FormField
          control={form.control}
          name="toDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>To Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Reason */}
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Input
                  placeholder="Please provide a reason for your leave request..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Spinner className="mr-2 h-4 w-4" />}
          {isPending ? "Submitting..." : "Submit Leave Application"}
        </Button>
      </form>
    </Form>
  );
}

export default ApplyLeaveForm;