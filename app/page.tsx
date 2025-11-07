import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center items-center h-screen space-y-8 bg-background">
      <h1 className="text-5xl font-bold text-primary">Nyx Minds</h1>

      <div className="flex space-x-4">
        <Button variant="default" size="lg" asChild>
          <Link href={"/auth/login"}>Log In</Link>
        </Button>
        <Button variant="outline" size="lg">
          <Link href={"/auth/signup"}>Sign Up</Link>
        </Button>
      </div>
    </div>
  );
}
