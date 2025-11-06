"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { createReport } from "@/actions/reports";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";

export const formSchema = z.object({
  todaysWork: z.string().min(5, {
    message: "Please describe your work for today (min 5 chars).",
  }),
  blockers: z.string().optional(),
  tomorrowsPlans: z.string().min(5, {
    message: "Please describe your plans for tomorrow (min 5 chars).",
  }),
});

export function ReportWriting() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      todaysWork: "",
      blockers: "",
      tomorrowsPlans: "",
    },
  });

  // ✅ Call server action here
  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        await createReport(values);
        toast.success("Report submitted successfully!");

        form.reset();
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error creating report:", error);
          toast.error(error.message || "Failed to submit report");
        } else {
          toast.error("Failed to submit report");
        }
      }
    });
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      <header className="w-full py-8 px-6 md:px-12 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
          Daily Report
        </h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">
          Fill out your daily work, blockers, and tomorrow&apos;s plans
        </p>
      </header>

      <main className="flex-1 flex justify-center items-start px-4 md:px-12 pb-12">
        <div className="w-full max-w-4xl bg-card rounded-3xl p-8 md:p-12">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Today's Work */}
              <FormField
                control={form.control}
                name="todaysWork"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Today&apos;s Work</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What did you work on today?"
                        className="min-h-[140px] text-base md:text-lg p-4"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Briefly describe what you accomplished today.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Blockers */}
              <FormField
                control={form.control}
                name="blockers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blockers</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any challenges or blockers?"
                        className="min-h-[120px] text-base md:text-lg p-4"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Mention anything that slowed you down.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tomorrow's Plans */}
              <FormField
                control={form.control}
                name="tomorrowsPlans"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tomorrow&apos;s Plans</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What do you plan to work on tomorrow?"
                        className="min-h-[140px] text-base md:text-lg p-4"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Outline your goals or tasks for tomorrow.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex justify-center mt-4">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="px-10 py-3 text-base md:text-lg"
                >
                  {isPending ? <Spinner /> : "Submit"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
