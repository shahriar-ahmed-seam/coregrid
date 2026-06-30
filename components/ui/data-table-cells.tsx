"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

// ==========================================
// STATUS CELL
// ==========================================

interface StatusCellProps {
  status: string;
  variant?: "default" | "success" | "warning" | "error" | "info" | "pending";
}

const statusVariants: Record<string, { className: string; icon?: React.ReactNode }> = {
  // Common statuses
  active: { className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: <CheckCircle className="h-3 w-3" /> },
  inactive: { className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400", icon: <XCircle className="h-3 w-3" /> },
  pending: { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: <Clock className="h-3 w-3" /> },
  approved: { className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: <XCircle className="h-3 w-3" /> },
  cancelled: { className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400", icon: <XCircle className="h-3 w-3" /> },
  
  // Employee statuses
  full_time: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  part_time: { className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  contract: { className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  intern: { className: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400" },
  terminated: { className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  on_leave: { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  
  // Deal stages
  lead: { className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400" },
  qualified: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  proposal: { className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  negotiation: { className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  won: { className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: <CheckCircle className="h-3 w-3" /> },
  lost: { className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: <XCircle className="h-3 w-3" /> },
  
  // Invoice statuses
  draft: { className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400" },
  sent: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  paid: { className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: <CheckCircle className="h-3 w-3" /> },
  overdue: { className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: <AlertTriangle className="h-3 w-3" /> },
  void: { className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400", icon: <XCircle className="h-3 w-3" /> },
  
  // Project statuses
  not_started: { className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400" },
  in_progress: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  on_hold: { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  completed: { className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: <CheckCircle className="h-3 w-3" /> },
  
  // Task priorities
  low: { className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400" },
  medium: { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  high: { className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  urgent: { className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: <AlertTriangle className="h-3 w-3" /> },
  
  // Purchase order statuses
  ordered: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  shipped: { className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  delivered: { className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: <CheckCircle className="h-3 w-3" /> },
};

export function StatusCell({ status }: StatusCellProps) {
  const normalizedStatus = status.toLowerCase().replace(/ /g, "_");
  const variant = statusVariants[normalizedStatus] || {
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <Badge className={cn("font-medium gap-1", variant.className)}>
      {variant.icon}
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

// ==========================================
// USER CELL
// ==========================================

interface UserCellProps {
  name: string;
  email?: string;
  image?: string | null;
  subtitle?: string;
}

export function UserCell({ name, email, image, subtitle }: UserCellProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={image || undefined} alt={name} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-medium text-sm">{name}</span>
        {(email || subtitle) && (
          <span className="text-xs text-muted-foreground">{subtitle || email}</span>
        )}
      </div>
    </div>
  );
}

// ==========================================
// CURRENCY CELL
// ==========================================

interface CurrencyCellProps {
  value: number;
  currency?: string;
  locale?: string;
  showSign?: boolean;
}

export function CurrencyCell({
  value,
  currency = "USD",
  locale = "en-US",
  showSign = false,
}: CurrencyCellProps) {
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));

  const isNegative = value < 0;
  const isPositive = value > 0;

  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        showSign && isNegative && "text-red-600 dark:text-red-400",
        showSign && isPositive && "text-green-600 dark:text-green-400"
      )}
    >
      {showSign && isNegative && "-"}
      {showSign && isPositive && "+"}
      {formatted}
    </span>
  );
}

// ==========================================
// PERCENTAGE CELL
// ==========================================

interface PercentageCellProps {
  value: number;
  showBar?: boolean;
  colorByValue?: boolean;
}

export function PercentageCell({
  value,
  showBar = false,
  colorByValue = false,
}: PercentageCellProps) {
  const percentage = Math.min(100, Math.max(0, value));
  
  const getColor = () => {
    if (!colorByValue) return "bg-primary";
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium tabular-nums w-12">{percentage.toFixed(0)}%</span>
      {showBar && (
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-16">
          <div
            className={cn("h-full rounded-full transition-all", getColor())}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ==========================================
// DATE CELL
// ==========================================

export interface DateCellProps {
  date?: Date | string | null | undefined;
  value?: Date | string | null | undefined; // alias for date
  format?: "short" | "medium" | "long" | "relative" | string;
  showTime?: boolean;
}

export function DateCell({ date, value, format = "medium", showTime = false }: DateCellProps) {
  const dateValue = date ?? value;
  if (!dateValue) {
    return <span className="text-muted-foreground">—</span>;
  }

  const dateObj = typeof dateValue === "string" ? new Date(dateValue) : dateValue;

  if (format === "relative") {
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return <span>Today</span>;
    if (days === 1) return <span>Yesterday</span>;
    if (days === -1) return <span>Tomorrow</span>;
    if (days > 0 && days < 7) return <span>{days} days ago</span>;
    if (days < 0 && days > -7) return <span>In {Math.abs(days)} days</span>;
  }

  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: "numeric", day: "numeric", year: "2-digit" },
    medium: { month: "short", day: "numeric", year: "numeric" },
    long: { month: "long", day: "numeric", year: "numeric" },
    relative: { month: "short", day: "numeric", year: "numeric" },
  };
  const options: Intl.DateTimeFormatOptions = { ...formatOptions[format] };

  if (showTime) {
    options.hour = "numeric";
    options.minute = "2-digit";
  }

  return <span>{dateObj.toLocaleDateString("en-US", options)}</span>;
}

// ==========================================
// TREND CELL
// ==========================================

interface TrendCellProps {
  value: number;
  previousValue?: number;
  suffix?: string;
  format?: "number" | "currency" | "percentage";
}

export function TrendCell({
  value,
  previousValue,
  suffix = "",
  format = "number",
}: TrendCellProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
        }).format(val);
      case "percentage":
        return `${val.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat("en-US").format(val);
    }
  };

  const change = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium tabular-nums">
        {formatValue(value)}
        {suffix}
      </span>
      {previousValue !== undefined && (
        <span
          className={cn(
            "flex items-center text-xs",
            isPositive && "text-green-600 dark:text-green-400",
            isNegative && "text-red-600 dark:text-red-400",
            !isPositive && !isNegative && "text-muted-foreground"
          )}
        >
          {isPositive && <TrendingUp className="h-3 w-3 mr-0.5" />}
          {isNegative && <TrendingDown className="h-3 w-3 mr-0.5" />}
          {!isPositive && !isNegative && <Minus className="h-3 w-3 mr-0.5" />}
          {Math.abs(change).toFixed(1)}%
        </span>
      )}
    </div>
  );
}

// ==========================================
// BOOLEAN CELL
// ==========================================

interface BooleanCellProps {
  value: boolean;
  trueLabel?: string;
  falseLabel?: string;
}

export function BooleanCell({
  value,
  trueLabel = "Yes",
  falseLabel = "No",
}: BooleanCellProps) {
  return value ? (
    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
      <CheckCircle className="h-3 w-3 mr-1" />
      {trueLabel}
    </Badge>
  ) : (
    <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
      <XCircle className="h-3 w-3 mr-1" />
      {falseLabel}
    </Badge>
  );
}

// ==========================================
// TAGS CELL
// ==========================================

interface TagsCellProps {
  tags: string[];
  max?: number;
}

export function TagsCell({ tags, max = 3 }: TagsCellProps) {
  const displayed = tags.slice(0, max);
  const remaining = tags.length - max;

  return (
    <div className="flex flex-wrap gap-1">
      {displayed.map((tag) => (
        <Badge key={tag} variant="outline" className="text-xs">
          {tag}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="secondary" className="text-xs">
          +{remaining}
        </Badge>
      )}
    </div>
  );
}

// ==========================================
// STOCK LEVEL CELL
// ==========================================

interface StockLevelCellProps {
  current: number;
  minimum: number;
  maximum?: number;
}

export function StockLevelCell({ current, minimum, maximum }: StockLevelCellProps) {
  const isLow = current <= minimum;
  const isCritical = current === 0;
  const isOverstock = maximum && current > maximum;

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium tabular-nums">{current}</span>
      {isCritical && (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          Out of Stock
        </Badge>
      )}
      {!isCritical && isLow && (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          Low Stock
        </Badge>
      )}
      {isOverstock && (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          Overstock
        </Badge>
      )}
    </div>
  );
}
