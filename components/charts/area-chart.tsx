"use client";

import { Area, AreaChart as RechartsAreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AreaChartProps {
  title?: string;
  description?: string;
  data: any[];
  areas: {
    key: string;
    name: string;
    color: string;
  }[];
  xAxisKey: string;
  height?: number;
  valueFormatter?: (value?: number) => string;
  stacked?: boolean;
}

export function AreaChart({
  title,
  description,
  data,
  areas,
  xAxisKey,
  height = 300,
  valueFormatter = (value) => (value == null ? "—" : value.toString()),
  stacked = false,
}: AreaChartProps) {
  return (
    <Card>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsAreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey={xAxisKey}
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={valueFormatter}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              formatter={valueFormatter}
            />
            <Legend />
            {areas.map((area) => (
              <Area
                key={area.key}
                type="monotone"
                dataKey={area.key}
                name={area.name}
                stroke={area.color}
                fill={area.color}
                fillOpacity={0.6}
                stackId={stacked ? "1" : undefined}
              />
            ))}
          </RechartsAreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
