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
import { CategoricalChartProps } from 'recharts/types/chart/generateCategoricalChart';
import { BaseAxisProps } from 'recharts/types/util/types';

import { ChartColor, chartColorsList, chartColorsMap } from '@ui/colors';
import { Separator } from '@ui/separator';
import { Skeleton } from '@ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@ui/toggle-group';
import { Text } from '@ui/typography';

type ChartLabel = {
  position:
    | 'top'
    | 'left'
    | 'right'
    | 'bottom'
    | 'inside'
    | 'outside'
    | 'insideLeft'
    | 'insideRight'
    | 'insideTop'
    | 'insideBottom'
    | 'insideTopLeft'
    | 'insideBottomLeft'
    | 'insideTopRight'
    | 'insideBottomRight'
    | 'insideStart'
    | 'insideEnd'
    | 'end';
  minLabelGap?: number;
  skipFirst?: boolean;
};

interface Areas extends AreaProps {
  useGradient?: boolean;
  isActive?: boolean;
  label?: ChartLabel;
}

interface Bars extends BarProps {
  useGradient?: boolean;
  isActive?: boolean;
  label?: ChartLabel;
}

interface Lines extends LineProps {
  isActive?: boolean;
  label?: ChartLabel;
}

interface ToolTips extends TooltipProps<number, string> {
  enabled: boolean;
  hideLabel?: boolean;
}

function textColor(theme: string | undefined) {
  return theme === 'light' ? 'hsl(240 10% 3.9)' : 'hsl(0 0% 98%)';
}

type Formatters = {
  formatter: BaseAxisProps['tickFormatter'];
  dataKeys: string[];
};

function findFormatter(formatters: Formatters[] | undefined, dataKey: unknown) {
  if (typeof dataKey !== 'string') {
    return undefined;
  }

  return formatters?.find((formatter) => formatter.dataKeys.includes(dataKey))
    ?.formatter;
}

function formatLabel(
  value: number | string,
  label: ChartLabel | undefined,
  dataKey: Areas['dataKey'] | Bars['dataKey'] | Lines['dataKey'] | undefined,
  formatters: Formatters[] | undefined,
  index: number,
  incrementIndexCallBack: () => void,
  resetIndexCallBack: () => void,
  dataLength: number,
) {
  let shouldSkip = false;
  if (
    !label ||
    !formatters ||
    (label?.minLabelGap && index % (label?.minLabelGap + 1) !== 0) ||
    (label?.skipFirst && index === 0)
  ) {
    shouldSkip = true;
  }
  incrementIndexCallBack();
  if (index + 1 === dataLength) {
    resetIndexCallBack();
  }

  if (shouldSkip) {
    return undefined;
  }

  const formatter = findFormatter(formatters, dataKey);

  return formatter ? formatter(value, index - 1) : value;
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
  formatters,
  composedChartProps,
}: {
  data: T[];
  areas?: Areas[];
  bars?: Bars[];
  lines?: Lines[];
  xAxis?: XAxisProps[];
  yAxis?: YAxisProps[];
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
  formatters?: Formatters[];
  composedChartProps?: CategoricalChartProps;
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

      <ResponsiveContainer className="size-full overflow-visible">
        <ComposedChart
          data={data}
          onMouseMove={(e) => {
            if (dataIndexCallback) {
              dataIndexCallback(e.activeTooltipIndex || 0);
            }
          }}
          {...composedChartProps}
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
              key={`${index}-x-axis`}
              tickLine={xAxis.tickLine || false}
              axisLine={xAxis.axisLine || false}
              tick={
                xAxis.tick || {
                  fill: textColor(resolvedTheme),
                }
              }
              className="pt-2"
              padding={xAxis.padding || { left: 10, right: 10 }}
              tickFormatter={findFormatter(formatters, xAxis.dataKey)}
              {...xAxis}
            />
          ))}
          {yAxis.map(
            (yAxis, index) =>
              (!yAxis.dataKey ||
                activeKeys.includes(yAxis.dataKey.toString())) && (
                <YAxis
                  key={`${index}-y-axis`}
                  tickLine={yAxis.tickLine || false}
                  axisLine={yAxis.axisLine || false}
                  tick={{
                    fill: textColor(resolvedTheme),
                  }}
                  width={yAxis.width || 60}
                  {...yAxis}
                  padding={yAxis.padding || { top: 10, bottom: 10 }}
                  tickFormatter={findFormatter(formatters, yAxis.dataKey)}
                />
              ),
          )}

          {/* Setup Tooltip */}
          {toolTip?.enabled && (
            <Tooltip
              // type-coverage:ignore-next-line
              content={({ active, payload, label, labelFormatter }) => {
                if (active) {
                  return (
                    <div className="min-w-32 rounded-lg border bg-background py-2 shadow-2xl">
                      {!toolTip.hideLabel && (
                        <>
                          <div className="px-2">
                            <Text>
                              {labelFormatter && payload
                                ? // type-coverage:ignore-next-line
                                  labelFormatter(label, payload)
                                : label}
                            </Text>
                          </div>
                          <Separator />
                        </>
                      )}

                      <div className="flex flex-col px-2">
                        {payload?.map((item, index) => {
                          const matchingFormatter = formatters?.find(
                            (formatter) =>
                              formatter.dataKeys.includes(
                                item.dataKey as string,
                              ),
                          )?.formatter;
                          return (
                            <div
                              key={`${index}-tooltip`}
                              className="flex items-center align-middle"
                            >
                              <div
                                className="mr-2 size-4 rounded-full"
                                style={{
                                  backgroundColor: item.color,
                                }}
                              />
                              <Text>
                                {matchingFormatter
                                  ? matchingFormatter(
                                      // type-coverage:ignore-next-line
                                      item.payload[item.dataKey || ''],
                                      0,
                                    )
                                  : // type-coverage:ignore-next-line
                                    item.payload[item.dataKey || '']}
                              </Text>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
              }}
              {...toolTip}
            />
          )}

          {/* Setup Charts */}
          {areas.map((area, index) => {
            keyCount += 1;
            let labelIndex = 0;
            return (
              <Area
                key={`${keyCount}-area`}
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
                label={{
                  formatter: (value: number | string) => {
                    return formatLabel(
                      value,
                      area.label,
                      area.dataKey,
                      formatters,
                      labelIndex,
                      () => (labelIndex += 1),
                      () => (labelIndex = 0),
                      data.length,
                    );
                  },
                  position: area.label?.position || 'top',
                }}
              />
            );
          })}

          {bars.map((bar) => {
            keyCount += 1;
            let labelIndex = 0;
            return (
              <Bar
                key={`${keyCount}-bar`}
                dataKey={bar.isActive ? bar.dataKey : ''}
                fill={
                  bar.useGradient
                    ? `url(#${[keyCount % colors.length]}-${uid})`
                    : chartColorsMap[colors[keyCount % colors.length]]
                }
                animationDuration={bar.animationDuration}
                stackId={bar.stackId}
                label={{
                  formatter: (value: number | string) =>
                    formatLabel(
                      value,
                      bar.label,
                      bar.dataKey,
                      formatters,
                      labelIndex,
                      () => {
                        labelIndex += 1;
                      },
                      () => {
                        labelIndex = 0;
                      },
                      data.length,
                    ),
                  position: bar.label?.position || 'top',
                }}
              />
            );
          })}

          {lines.map((line) => {
            keyCount += 1;
            let labelIndex = 0;
            return (
              <Line
                key={`${keyCount}-line`}
                type="monotone"
                dataKey={line.isActive ? line.dataKey : ''}
                stroke={chartColorsMap[colors[keyCount % colors.length]]}
                dot={line.dot || false}
                strokeWidth={line.strokeWidth || 2}
                animationDuration={line.animationDuration}
                label={{
                  formatter: (value: number | string) =>
                    formatLabel(
                      value,
                      line.label,
                      line.dataKey,
                      formatters,
                      labelIndex,
                      () => {
                        labelIndex += 1;
                      },
                      () => {
                        labelIndex = 0;
                      },
                      data.length,
                    ),
                  position: line.label?.position || 'top',
                }}
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );
}
