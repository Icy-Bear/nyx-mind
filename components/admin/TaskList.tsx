"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { SelectTasks } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { updateTaskStatus } from "@/actions/taskActions";

// Helper to group tasks
const groupTasks = (tasks: SelectTasks[]) => {
  return tasks.reduce((acc, task) => {
    if (!acc[task.milestone]) {
      acc[task.milestone] = {};
    }
    if (!acc[task.milestone][task.title]) {
      acc[task.milestone][task.title] = [];
    }
    acc[task.milestone][task.title].push(task);
    return acc;
  }, {} as Record<string, Record<string, SelectTasks[]>>);
};

export default function TaskList({ tasks }: { tasks: SelectTasks[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (tasks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">No tasks found for this project.</p>
      </div>
    );
  }

  const handleTaskToggle = (taskId: string, currentStatus: boolean) => {
    startTransition(async () => {
      try {
        await updateTaskStatus(taskId, !currentStatus);
        router.refresh();
        toast.success("Task status updated!");
      } catch (error) {
        console.error("Failed to update task status:", error);
        toast.error("Failed to update task status.");
      }
    });
  };

  const groupedByMilestone = groupTasks(tasks);

  return (
    <div className="space-y-6">
      {Object.entries(groupedByMilestone).map(([milestone, titles]) => (
        <Card key={milestone}>
          <CardHeader>
            <CardTitle className="text-xl">{milestone}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(titles).map(([title, taskItems]) => (
              <div key={title}>
                <h3 className="font-semibold mb-2">{title}</h3>
                <div className="space-y-2 pl-4 border-l-2">
                  {taskItems.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={task.done}
                          onCheckedChange={() =>
                            handleTaskToggle(task.id, task.done)
                          }
                          disabled={isPending}
                        />
                        <label
                          htmlFor={`task-${task.id}`}
                          className="cursor-pointer"
                        >
                          {task.name}
                        </label>
                      </div>
                      <Badge variant={task.done ? "default" : "secondary"}>
                        {task.done ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
