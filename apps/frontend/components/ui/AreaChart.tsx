import { useTheme } from 'next-themes';
import React from 'react';
import {
  Area,
  AreaProps,
  Bar,
  BarProps,
  ComposedChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  TooltipProps,
  XAxis,
  XAxisProps,
  YAxis,
  YAxisProps,
} from 'recharts';

import { ChartColor, chartColorsList, chartColorsMap } from './colors';
import { Skeleton } from './skeleton';

interface Areas extends AreaProps {
  useGradient?: boolean;
}

function textColor(theme: string | undefined) {
  return theme === 'light' ? 'hsl(240 10% 3.9)' : 'hsl(0 0% 98%)';
}

export function Chart<T>({
  data,
  areas = [],
  bars = [],
  xAxis = [],
  yAxis = [],
  colors = chartColorsList,
  toolTip,
  isLoading = false,
}: {
  data: T[];
  areas?: Areas[];
  bars?: BarProps[];
  xAxis?: XAxisProps[];
  yAxis?: YAxisProps[];
  colors?: ChartColor[];
  toolTip?: TooltipProps<number, string> & {
    enabled: boolean;
  };
  isLoading?: boolean;
}) {
  const { resolvedTheme } = useTheme();

  if (isLoading) {
    return <Skeleton className="size-full" />;
  }

  return (
    <ResponsiveContainer className="size-full">
      <ComposedChart data={data}>
        {/* Setup Gradients */}
        <defs>
          {colors.map((color, index) => (
            <linearGradient
              key={color}
              id={index.toString()}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor={chartColorsMap[color]}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={chartColorsMap[color]}
                stopOpacity={0.2}
              />
            </linearGradient>
          ))}
        </defs>
        {/* <GradientDefs colors={colors} chartColorsMap={chartColorsMap} /> */}

        {/* Setup Axises */}
        {xAxis.map((xAxis, index) => (
          <XAxis
            key={index}
            tickLine={xAxis.tickLine || false}
            axisLine={xAxis.axisLine || false}
            tick={
              xAxis.tick || {
                fill: textColor(resolvedTheme),
              }
            }
            {...xAxis}
          />
        ))}

        {yAxis.map((yAxis, index) => (
          <YAxis
            key={index}
            tickLine={yAxis.tickLine || false}
            axisLine={yAxis.axisLine || false}
            tick={{
              fill: textColor(resolvedTheme),
            }}
            width={yAxis.width || 60}
            {...yAxis}
          />
        ))}

        {/* Setup Tooltip */}
        {toolTip?.enabled && (
          <Tooltip
            formatter={toolTip?.formatter}
            labelFormatter={toolTip?.labelFormatter}
          />
        )}

        {/* Setup Charts */}
        {areas.map((area, index) => (
          <Area
            key={index}
            type="monotone"
            dataKey={area.dataKey}
            stackId={index}
            stroke={chartColorsMap[colors[index % colors.length]]}
            fill={
              area.useGradient
                ? `url(#${index})`
                : chartColorsMap[colors[index % colors.length]]
            }
            strokeOpacity={area.strokeOpacity || 1}
            strokeWidth={area.strokeWidth || 2}
            fillOpacity={area.fillOpacity || 1}
            animationDuration={area.animationDuration}
          />
        ))}

        {bars.map((bar, index) => (
          <Bar
            key={index}
            dataKey={bar.dataKey}
            stackId={index}
            fill={chartColorsMap[colors[index % colors.length]]}
            animationDuration={bar.animationDuration}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// function GradientDefs({
//   colors,
//   chartColorsMap,
// }: {
//   colors: ChartColor[];
//   chartColorsMap: Record<string, string>;
// }) {
//   return (
//     <defs>
//       {colors.map((color, index) => (
//         <linearGradient
//           key={color}
//           id={index.toString()}
//           x1="0"
//           y1="0"
//           x2="0"
//           y2="1"
//         >
//           <stop
//             offset="5%"
//             stopColor={chartColorsMap[color]}
//             stopOpacity={0.8}
//           />
//           <stop
//             offset="95%"
//             stopColor={chartColorsMap[color]}
//             stopOpacity={0.2}
//           />
//         </linearGradient>
//       ))}
//     </defs>
//   );
// }

function Tooltip(props: TooltipProps<number, string>) {
  const { resolvedTheme } = useTheme();
  return (
    <RechartsTooltip
      itemStyle={{
        color: textColor(resolvedTheme),
      }}
      contentStyle={{
        backgroundColor:
          resolvedTheme === 'light' ? 'hsl(0 0% 100)' : 'hsl(240 10% 3.9%)',
        border: '0px',
        boxShadow: '0px 0px 10px 0px hsl(0 0% 0%)',
        borderRadius: 'var(--radius)',
      }}
      {...props}
    />
  );
}
