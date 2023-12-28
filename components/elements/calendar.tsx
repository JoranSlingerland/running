import { Calendar, Select, Button, Card, Typography } from 'antd';
import dayLocaleData from 'dayjs/plugin/localeData';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import type { Activity } from '../services/data/activities';
import { formatDistance, formatTime, formatPace } from '../utils/formatting';
import { CaretRightOutlined, CaretLeftOutlined } from '@ant-design/icons';
import { CalendarMode } from 'antd/es/calendar/generateCalendar';

const { Text } = Typography;

dayjs.extend(dayLocaleData);
dayjs.extend(updateLocale);

export default function AntdCalendar({
  data,
  startOfWeekDay = 1,
  isLoading = false,
  onPanelChange,
}: {
  data: Activity[] | undefined;
  startOfWeekDay?: number;
  isLoading?: boolean;
  onPanelChange?: (value: dayjs.Dayjs, mode: CalendarMode) => void;
}): JSX.Element {
  dayjs.updateLocale('en', {
    weekStart: startOfWeekDay,
  });

  return (
    <Calendar
      onPanelChange={onPanelChange}
      headerRender={({ value, type, onChange, onTypeChange }) => {
        const start = 0;
        const end = 12;
        const monthOptions = [];

        let current = value.clone();
        const localeData = value.localeData();
        const months = [];
        for (let i = 0; i < 12; i++) {
          current = current.month(i);
          months.push(localeData.months(current));
        }

        for (let i = start; i < end; i++) {
          monthOptions.push(
            <Select.Option key={i} value={i}>
              {months[i]}
            </Select.Option>,
          );
        }

        const year = value.year();
        const month = value.month();
        const options = [];
        for (let i = year - 10; i < year + 10; i += 1) {
          options.push(
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>,
          );
        }
        return (
          <div>
            <div className="space-x-2">
              <Select
                value={year}
                onChange={(newYear) => {
                  const now = value.clone().year(newYear);
                  onChange(now);
                }}
              >
                {options}
              </Select>
              <Select
                value={month}
                onChange={(newMonth) => {
                  const now = value.clone().month(newMonth);
                  onChange(now);
                }}
              >
                {monthOptions}
              </Select>
              <Button
                onClick={() => {
                  const now = dayjs();
                  onChange(now);
                  console.log(now.format('DD-MM-YYYY'));
                }}
              >
                Today
              </Button>
              <Button
                onClick={() => {
                  const now = value.clone().subtract(1, 'month');
                  onChange(now);
                }}
                icon={<CaretLeftOutlined />}
              />
              <Button
                onClick={() => {
                  const now = value.clone().add(1, 'month');
                  onChange(now);
                }}
                icon={<CaretRightOutlined />}
              />
            </div>
          </div>
        );
      }}
      fullCellRender={(value: Dayjs) => {
        const date = value.format('YYYY-MM-DD');
        const filtered = data
          ? data.filter((item) => {
              return item.start_date.includes(date);
            })
          : [];
        return (
          <Card
            size="default"
            title={
              <div className="flex justify-between">
                <div>{value.format('DD')}</div>
                <div>
                  {value.format('DD') === '01' ? value.format('MMMM') : ''}
                </div>
              </div>
            }
            bordered={false}
            loading={isLoading}
            style={{ height: '100%', minHeight: '200px' }}
            bodyStyle={{ padding: '0px' }}
            headStyle={{ padding: '0px', paddingLeft: '8px' }}
          >
            <div>{filtered.map((item) => calendarItem({ item }))}</div>
          </Card>
        );
      }}
    />
  );
}

function calendarItem({ item }: { item: Activity }) {
  return (
    <Card
      size="small"
      style={{ height: '100%' }}
      bodyStyle={{ padding: '0px' }}
      title={item.type}
      className="my-2"
      hoverable
    >
      <div className="flex flex-col text-left ml-2">
        {item.elapsed_time !== null &&
          item.elapsed_time !== undefined &&
          item.elapsed_time !== 0 && (
            <Text>{formatTime(item.elapsed_time)}</Text>
          )}
        {item.distance !== null &&
          item.distance !== undefined &&
          item.distance !== 0 && (
            <Text> {formatDistance(item.distance, 'km')}</Text>
          )}
        {item.average_heartrate !== null &&
          item.average_heartrate !== undefined &&
          item.average_heartrate !== 0 && (
            <Text>{item.average_heartrate} BPM</Text>
          )}
        {item.average_speed !== null &&
          item.average_speed !== undefined &&
          item.average_speed !== 0 && (
            <Text>{formatPace(item.average_speed, 'km')}</Text>
          )}
      </div>
    </Card>
  );
}
