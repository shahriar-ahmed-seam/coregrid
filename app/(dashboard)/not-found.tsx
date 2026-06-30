import { Building2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center space-y-4">
      <Building2 className="h-16 w-16 text-muted-foreground" />
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
