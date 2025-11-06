"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { InsertProject } from "@/db/schema";
import { addProject } from "@/actions/projectActions";
import { getAllUsers } from "@/actions/users";
import { Spinner } from "../ui/spinner";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required."),
  idea: z.string().min(1, "Project idea is required."),
  userid: z.string().min(1, "Please select a user."),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function AddProject({
  setOpen,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      idea: "",
      userid: "",
    },
  });

  useEffect(() => {
    async function fetchUsers() {
      try {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to fetch users.");
      }
    }
    fetchUsers();
  }, []);

  async function onSubmit(values: ProjectFormValues) {
    setIsPending(true);
    try {
      // The values are already validated by zod, so we can cast it safely
      await addProject(values as InsertProject);
      toast.success("Project created successfully!");
      form.reset();
      setOpen(false); // Close the dialog
      router.refresh(); // Refresh server components to show the new project
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter project name" {...field} />
              </FormControl>
              <FormDescription>The name of the new project.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="idea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Idea</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your project idea..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A brief overview of the project&apos;s concept.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="userid"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign to User</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the user responsible for this project.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? <Spinner /> : "Create Project"}
        </Button>
      </form>
    </Form>
  );
}
