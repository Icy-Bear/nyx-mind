"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
import { Input } from "@/components/ui/input";
import { Spinner } from "../ui/spinner";
import { addTask } from "@/actions/taskActions";
import { InsertTasks, SelectProject } from "@/db/schema";

const taskSchema = z.object({
  name: z.string().min(1, "Task name is required."),
  milestone: z.string().min(1, "Milestone is required."),
  title: z.string().min(1, "Title is required."),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function AddTask({
  project,
  setOpen,
}: {
  project: SelectProject;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: "",
      milestone: "",
      title: "",
    },
  });

  async function onSubmit(values: TaskFormValues) {
    setIsPending(true);

    const taskData: InsertTasks = {
      ...values,
      projectid: project.id,
      done: false,
    };

    try {
      await addTask(taskData);
      toast.success("Task added successfully!");
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to add task:", error);
      toast.error("Failed to add task.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="milestone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Milestone</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Sprint 1, Phase 1" {...field} />
              </FormControl>
              <FormDescription>
                The milestone this task belongs to.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Backend API, UI Design" {...field} />
              </FormControl>
              <FormDescription>
                A category or title for this task.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Implement user authentication"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The specific task to be completed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? <Spinner /> : "Add Task"}
        </Button>
      </form>
    </Form>
  );
}
