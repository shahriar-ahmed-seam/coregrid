"use client";

import { Bar, BarChart as RechartsBarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BarChartProps {
  title?: string;
  description?: string;
  data: any[];
  dataKeys: {
    key: string;
    name: string;
    color: string;
  }[];
  xAxisKey: string;
  height?: number;
  valueFormatter?: (value?: number) => string;
}

export function BarChart({
  title,
  description,
  data,
  dataKeys,
  xAxisKey,
  height = 300,
  valueFormatter = (value) => (value == null ? "—" : value.toString()),
}: BarChartProps) {
  return (
    <Card>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="text-base">{title}</CardTitle>}
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart data={data}>
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
            {dataKeys.map((dataKey) => (
              <Bar
                key={dataKey.key}
                dataKey={dataKey.key}
                name={dataKey.name}
                fill={dataKey.color}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
