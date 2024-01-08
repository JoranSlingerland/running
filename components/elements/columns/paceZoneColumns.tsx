import type { ColumnsType } from 'antd/es/table';
import { Typography } from 'antd';
import { formatPace } from '@utils/formatting';

const { Text } = Typography;

type HeartRateZoneData = {
  name: string;
  min: number;
  max: number;
};

export const paceZoneColumns: ColumnsType<HeartRateZoneData> = [
  {
    title: 'Zone',
    dataIndex: 'name',
    key: 'name',
    render: (text: string) => <Text>{text}</Text>,
  },
  {
    title: 'From',
    dataIndex: 'min',
    key: 'min',
    render: (text: number) => formatPace(text, 'km', true, true),
  },
  {
    title: 'To',
    dataIndex: 'max',
    key: 'max',
    render: (text: number) => formatPace(text, 'km', true, true),
  },
];
