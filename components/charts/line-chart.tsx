"use client";

import { CartesianGrid, Legend, Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LineChartProps {
  title?: string;
  description?: string;
  data: any[];
  lines: {
    key: string;
    name: string;
    color: string;
  }[];
  xAxisKey: string;
  height?: number;
  valueFormatter?: (value?: number) => string;
}

export function LineChart({
  title,
  description,
  data,
  lines,
  xAxisKey,
  height = 300,
  valueFormatter = (value) => (value == null ? "—" : value.toString()),
}: LineChartProps) {
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
          <RechartsLineChart data={data}>
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
            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
