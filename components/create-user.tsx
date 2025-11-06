"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { createUser } from "@/actions/users";
import { toast } from "sonner";

// Validation schema
const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(["ADMIN", "MEMBER"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CreateUser = z.infer<typeof createUserSchema>;

export function AddUser() {
  const [open, setOpen] = React.useState<boolean>(false);
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const form = useForm<CreateUser>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "MEMBER",
    },
  });

  async function onSubmit(values: CreateUser) {
    try {
      setIsPending(true);
      await createUser({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });

      toast.success("User created successfully");
      form.reset();
      setOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to create user");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-20 md:right-10 z-50 shadow-lg">
          <Plus className="mr-2 h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Create User</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="overflow-hidden p-0 max-h-[90vh] w-[95vw] max-w-md sm:max-w-lg md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogTitle className="sr-only">Create user</DialogTitle>
        <DialogDescription className="sr-only">
          Create a new user.
        </DialogDescription>

        <main className="flex flex-1 flex-col overflow-hidden p-3 sm:p-4 md:p-6">
          <header className="flex h-12 sm:h-16 shrink-0 items-center gap-2 px-2 sm:px-4">
            <div className="flex items-center gap-2 text-lg sm:text-xl font-semibold">Create User</div>
          </header>

          <div className="flex-1 overflow-y-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" className="h-10 sm:h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john@example.com"
                        type="email"
                        className="h-10 sm:h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        className="h-10 sm:h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        className="h-10 sm:h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Role</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="h-10 sm:h-11">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="MEMBER">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-11 sm:h-12 text-sm sm:text-base" disabled={isPending}>
                {isPending && <Spinner className="mr-2 h-4 w-4" />}
                {isPending ? "Creating User..." : "Create User"}
              </Button>
            </form>
          </Form>
          </div>
        </main>
      </DialogContent>
    </Dialog>
  );
}

export default AddUser;
