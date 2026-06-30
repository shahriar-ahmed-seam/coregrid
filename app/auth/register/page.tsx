"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Building2 } from "lucide-react";
import { UserRole } from "@prisma/client";
import { AuthShell } from "@/components/marketing/auth-shell";

export default function RegisterPage() {
  const router = useRouter();
  const isDemo = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "EMPLOYEE" as UserRole,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Standalone demo mode: no auth backend — simulate success.
    if (isDemo) {
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1400);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <Building2 className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Registration Successful!</CardTitle>
            <CardDescription>
              {isDemo ? "Taking you into the workspace..." : "Redirecting you to the login page..."}
            </CardDescription>
          </CardHeader>
        </Card>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>
            Register to get started with CoreGrid ERP
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {isDemo && (
              <div className="p-3 text-sm text-primary bg-primary/10 border border-primary/20 rounded-lg">
                <strong>Live demo</strong> — accounts aren&apos;t persisted. Submit
                to jump straight into the workspace.
              </div>
            )}
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={isLoading}
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@company.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) =>
                  setFormData({ ...formData, role: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  <SelectItem value="HR">HR Manager</SelectItem>
                  <SelectItem value="SALES">Sales Representative</SelectItem>
                  <SelectItem value="INVENTORY">Inventory Manager</SelectItem>
                  <SelectItem value="FINANCE">Finance Manager</SelectItem>
                  <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                disabled={isLoading}
                autoComplete="new-password"
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                disabled={isLoading}
                autoComplete="new-password"
                minLength={8}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </AuthShell>
  );
}
