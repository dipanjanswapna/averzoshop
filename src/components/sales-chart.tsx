
'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
]

const chartConfig = {
  desktop: {
    label: "Sales",
    color: "hsl(var(--primary))",
  },
}

export function SalesChart() {
    return (
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            </BarChart>
        </ChartContainer>
    )
}
