import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import {
  Area,
  AreaProps,
  Bar,
  BarProps,
  ComposedChart,
  Line,
  LineProps,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  XAxisProps,
  YAxis,
  YAxisProps,
} from 'recharts';

import { ChartColor, chartColorsList, chartColorsMap } from '@ui/colors';
import { Separator } from '@ui/separator';
import { Skeleton } from '@ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@ui/toggle-group';
import { Text } from '@ui/typography';

interface Areas extends AreaProps {
  useGradient?: boolean;
  isActive?: boolean;
}

interface Bars extends BarProps {
  useGradient?: boolean;
  isActive?: boolean;
}

interface Lines extends LineProps {
  isActive?: boolean;
}

interface ToolTips extends TooltipProps<number, string> {
  enabled: boolean;
  hideLabel?: boolean;
}

interface YAxises extends YAxisProps {
  toolTipFormatDataKeys: string[];
}

function textColor(theme: string | undefined) {
  return theme === 'light' ? 'hsl(240 10% 3.9)' : 'hsl(0 0% 98%)';
}

export function Chart<T>({
  data,
  areas = [],
  bars = [],
  lines = [],
  xAxis = [],
  yAxis = [],
  colors = chartColorsList,
  toolTip,
  isLoading = false,
  gradient,
  toggle,
  dataIndexCallback,
}: {
  data: T[];
  areas?: Areas[];
  bars?: Bars[];
  lines?: Lines[];
  xAxis?: XAxisProps[];
  yAxis?: YAxises[];
  colors?: ChartColor[];
  toolTip?: ToolTips;
  isLoading?: boolean;
  dataIndexCallback?: (index: number) => void;
  gradient?: {
    startOpacity: number;
    endOpacity: number;
    uid?: string;
  };
  toggle?: {
    enabled: boolean;
    type: 'single' | 'multiple';
    initial: string[];
  };
}) {
  const { resolvedTheme } = useTheme();
  const keys = [...areas, ...bars, ...lines].map(
    (item) => item.dataKey?.toString() || '',
  );
  const [activeKeys, setActiveKeys] = useState<string[]>(
    toggle?.initial || keys,
  );
  let keyCount = -1;
  const uid = gradient?.uid || Math.random().toString(36).substring(2);

  areas.forEach((area) => {
    area.isActive = activeKeys.includes(area.dataKey.toString());
  });

  bars.forEach((bar) => {
    bar.isActive = activeKeys.includes(bar.dataKey.toString());
  });

  lines.forEach((line) => {
    line.isActive = activeKeys.includes(
      line.dataKey ? line.dataKey.toString() : '',
    );
  });

  useEffect(() => {
    areas.forEach((area) => {
      area.isActive = activeKeys.includes(area.dataKey.toString());
    });

    bars.forEach((bar) => {
      bar.isActive = activeKeys.includes(bar.dataKey.toString());
    });

    lines.forEach((line) => {
      line.isActive = activeKeys.includes(
        line.dataKey ? line.dataKey.toString() : '',
      );
    });
  }, [activeKeys, areas, bars, lines]);

  if (isLoading) {
    return <Skeleton className="size-full" />;
  }

  return (
    <>
      {toggle?.type === 'single' && toggle?.enabled && (
        <ToggleGroup
          type="single"
          value={activeKeys[0]}
          onValueChange={(value) => {
            if (value) {
              setActiveKeys([value]);
            }
          }}
        >
          {keys.map((key, index) => (
            <ToggleGroupItem key={index} value={key}>
              <div
                className="mr-2 size-4 rounded-full"
                style={{
                  backgroundColor:
                    chartColorsMap[colors[index % colors.length]],
                }}
              />
              {key}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}

      {toggle?.type === 'multiple' && toggle?.enabled && (
        <ToggleGroup
          type="multiple"
          value={activeKeys}
          onValueChange={(value) => {
            if (value) {
              setActiveKeys(value);
            }
          }}
        >
          {keys.map((key, index) => (
            <ToggleGroupItem key={index} value={key}>
              <div
                className="mr-2 size-4 rounded-full"
                style={{
                  backgroundColor:
                    chartColorsMap[colors[index % colors.length]],
                }}
              />
              {key}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}

      <ResponsiveContainer className="size-full">
        <ComposedChart
          data={data}
          onMouseMove={(e) => {
            if (dataIndexCallback) {
              dataIndexCallback(e.activeTooltipIndex || 0);
            }
          }}
        >
          {/* Setup Gradients */}
          <defs>
            {colors.map((color, index) => (
              <linearGradient
                key={color}
                id={`${index.toString()}-${uid}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={chartColorsMap[color]}
                  stopOpacity={gradient?.startOpacity || 0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartColorsMap[color]}
                  stopOpacity={gradient?.endOpacity || 0.2}
                />
              </linearGradient>
            ))}
          </defs>

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
              className="pt-2"
              padding={xAxis.padding || { left: 10, right: 10 }}
              {...xAxis}
            />
          ))}
          {yAxis.map(
            (yAxis, index) =>
              (!yAxis.dataKey ||
                activeKeys.includes(yAxis.dataKey.toString())) && (
                <YAxis
                  key={index}
                  tickLine={yAxis.tickLine || false}
                  axisLine={yAxis.axisLine || false}
                  tick={{
                    fill: textColor(resolvedTheme),
                  }}
                  width={yAxis.width || 60}
                  {...yAxis}
                  padding={yAxis.padding || { top: 10, bottom: 10 }}
                />
              ),
          )}

          {/* Setup Tooltip */}
          {toolTip?.enabled && (
            <Tooltip
              content={({ active, payload, label, labelFormatter }) => {
                if (active) {
                  return (
                    <div className="min-w-32 rounded-lg border bg-background py-2 shadow-2xl">
                      {!toolTip.hideLabel && (
                        <>
                          <div className="px-2">
                            <Text>
                              {labelFormatter && payload
                                ? labelFormatter(label, payload)
                                : label}
                            </Text>
                          </div>
                          <Separator />
                        </>
                      )}

                      <div className="flex flex-col px-2">
                        {payload?.map((item, index) => {
                          const matchingYAxis = yAxis.filter((y) =>
                            y.toolTipFormatDataKeys.includes(
                              item.dataKey as string,
                            ),
                          )[0];
                          return (
                            <div
                              key={index}
                              className="flex items-center align-middle"
                            >
                              <div
                                className="mr-2 size-4 rounded-full"
                                style={{
                                  backgroundColor: item.color,
                                }}
                              />
                              <Text>
                                {matchingYAxis?.tickFormatter
                                  ? matchingYAxis.tickFormatter(
                                      item.payload[item.dataKey || ''],
                                      0,
                                    )
                                  : item.payload[item.dataKey || '']}
                              </Text>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return 'test';
              }}
              {...toolTip}
            />
          )}

          {/* Setup Charts */}
          {areas.map((area, index) => {
            keyCount += 1;
            return (
              <Area
                key={keyCount}
                type="monotone"
                dataKey={area.isActive ? area.dataKey : ''}
                stackId={index}
                stroke={chartColorsMap[colors[keyCount % colors.length]]}
                fill={
                  area.useGradient
                    ? `url(#${[keyCount % colors.length]}-${uid})`
                    : chartColorsMap[colors[keyCount % colors.length]]
                }
                strokeOpacity={area.strokeOpacity || 1}
                strokeWidth={area.strokeWidth || 2}
                fillOpacity={area.fillOpacity || 1}
                animationDuration={area.animationDuration}
              />
            );
          })}

          {bars.map((bar) => {
            keyCount += 1;
            return (
              <Bar
                key={keyCount}
                dataKey={bar.isActive ? bar.dataKey : ''}
                fill={
                  bar.useGradient
                    ? `url(#${[keyCount % colors.length]}-${uid})`
                    : chartColorsMap[colors[keyCount % colors.length]]
                }
                animationDuration={bar.animationDuration}
                stackId={bar.stackId}
              />
            );
          })}

          {lines.map((line) => {
            keyCount += 1;
            return (
              <Line
                key={keyCount}
                type="monotone"
                dataKey={line.isActive ? line.dataKey : ''}
                stroke={chartColorsMap[colors[keyCount % colors.length]]}
                dot={line.dot || false}
                strokeWidth={line.strokeWidth || 2}
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );
}
