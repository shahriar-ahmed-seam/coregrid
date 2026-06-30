"use client";

import { Cell, Legend, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PieChartProps {
  title?: string;
  description?: string;
  data: {
    name: string;
    value: number;
  }[];
  colors?: string[];
  height?: number;
  valueFormatter?: (value?: number) => string;
}

const DEFAULT_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function PieChart({
  title,
  description,
  data,
  colors = DEFAULT_COLORS,
  height = 300,
  valueFormatter = (value) => (value == null ? "—" : value.toString()),
}: PieChartProps) {
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show percentage for cleaner look
    return (
      <text 
        x={x} 
        y={y} 
        fill="black" 
        textAnchor="middle" 
        dominantBaseline="central"
        style={{ fontSize: '12px', fontWeight: 700 }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

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
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={85}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              formatter={valueFormatter}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
