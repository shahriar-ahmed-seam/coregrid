import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title?: string;
  heading?: string;
  description?: string;
  backHref?: string;
  children?: ReactNode;
  action?: React.ReactNode;
}

export function PageHeader({ title, heading, description, backHref, children }: PageHeaderProps) {
  const displayTitle = title || heading || "";
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {backHref && (
            <Link href={backHref}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <h1 className="text-3xl font-bold tracking-tight">{displayTitle}</h1>
        </div>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
