import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Building2 } from "lucide-react";
import { AuthShell } from "@/components/marketing/auth-shell";

function LoginFormFallback() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Welcome to CoreGrid</CardTitle>
        <CardDescription>
          Sign in to your account to access the ERP system
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <AuthShell>
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
