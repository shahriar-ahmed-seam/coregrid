import { Building2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <ShieldAlert className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription>
            You don&apos;t have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            This page requires specific role permissions. Please contact your administrator if you believe you should have access.
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
