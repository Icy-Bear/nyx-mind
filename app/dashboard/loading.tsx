import { Spinner } from "@/components/ui/spinner";
export default function Loading() {
  return (
    <div className="min-h-screen bg-background p-3 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="h-8 w-8" />
        <p className="text-muted-foreground">
          Loading dashboard information...
        </p>
      </div>
    </div>
  );
}
