"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  LucideIcon,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// ==========================================
// STAT CARD
// ==========================================

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  const isPositive = trend && trend.value > 0;
  const isNegative = trend && trend.value < 0;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          {trend && (
            <span
              className={cn(
                "flex items-center",
                isPositive && "text-green-600 dark:text-green-400",
                isNegative && "text-red-600 dark:text-red-400"
              )}
            >
              {isPositive && <TrendingUp className="h-3 w-3 mr-1" />}
              {isNegative && <TrendingDown className="h-3 w-3 mr-1" />}
              {!isPositive && !isNegative && <Minus className="h-3 w-3 mr-1" />}
              {isPositive && "+"}
              {trend.value}%
            </span>
          )}
          {description && <span>{description}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// METRIC CARD
// ==========================================

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  changeLabel = "from last period",
  icon: Icon,
  iconColor = "text-primary",
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
            {change !== undefined && (
              <div className="flex items-center gap-1 text-sm">
                <span
                  className={cn(
                    "flex items-center font-medium",
                    change > 0
                      ? "text-green-600 dark:text-green-400"
                      : change < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                  )}
                >
                  {change > 0 && <ArrowUpRight className="h-4 w-4" />}
                  {change < 0 && <ArrowDownRight className="h-4 w-4" />}
                  {change > 0 && "+"}
                  {change}%
                </span>
                <span className="text-muted-foreground">{changeLabel}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "p-3 rounded-lg bg-muted/50",
                iconColor
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// COMPACT STAT
// ==========================================

interface CompactStatProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: number;
  className?: string;
}

export function CompactStat({
  label,
  value,
  icon: Icon,
  trend,
  className,
}: CompactStatProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {Icon && (
        <div className="p-2 rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold">{value}</p>
          {trend !== undefined && (
            <span
              className={cn(
                "text-xs",
                trend > 0
                  ? "text-green-600 dark:text-green-400"
                  : trend < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-muted-foreground"
              )}
            >
              {trend > 0 && "+"}
              {trend}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// STAT GRID
// ==========================================

interface StatGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

const gridClasses = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export function StatGrid({ children, columns = 4, className }: StatGridProps) {
  return (
    <div className={cn("grid gap-4", gridClasses[columns], className)}>
      {children}
    </div>
  );
}

// ==========================================
// PROGRESS STAT
// ==========================================

interface ProgressStatProps {
  title: string;
  current: number;
  total: number;
  unit?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressStat({
  title,
  current,
  total,
  unit = "",
  showPercentage = true,
  className,
}: ProgressStatProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          <span className="text-sm font-medium">
            {current}
            {unit} / {total}
            {unit}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              percentage >= 80
                ? "bg-green-500"
                : percentage >= 50
                ? "bg-yellow-500"
                : "bg-red-500"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showPercentage && (
          <p className="text-xs text-muted-foreground mt-1">
            {percentage.toFixed(0)}% complete
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ==========================================
// RING STAT
// ==========================================

interface RingStatProps {
  title: string;
  value: number;
  maxValue: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeConfig = {
  sm: { width: 60, strokeWidth: 4, textSize: "text-sm" },
  md: { width: 80, strokeWidth: 6, textSize: "text-lg" },
  lg: { width: 100, strokeWidth: 8, textSize: "text-xl" },
};

export function RingStat({
  title,
  value,
  maxValue,
  label,
  size = "md",
  className,
}: RingStatProps) {
  const config = sizeConfig[size];
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className={className}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="relative" style={{ width: config.width, height: config.width }}>
          <svg
            className="transform -rotate-90"
            width={config.width}
            height={config.width}
          >
            <circle
              className="text-muted"
              strokeWidth={config.strokeWidth}
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx={config.width / 2}
              cy={config.width / 2}
            />
            <circle
              className="text-primary transition-all duration-300"
              strokeWidth={config.strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx={config.width / 2}
              cy={config.width / 2}
            />
          </svg>
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center font-bold",
              config.textSize
            )}
          >
            {percentage.toFixed(0)}%
          </div>
        </div>
        <div>
          <p className="font-medium">{title}</p>
          {label && (
            <p className="text-sm text-muted-foreground">{label}</p>
          )}
          <p className="text-sm text-muted-foreground">
            {value} of {maxValue}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
