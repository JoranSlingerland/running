import type { ColumnsType } from 'antd/es/table';
import { Typography } from 'antd';
import { formatHeartRate } from '../../utils/formatting';

const { Text } = Typography;

type HeartRateZoneData = {
  name: string;
  min: number;
  max: number;
};

export const heartRateZoneColumns: ColumnsType<HeartRateZoneData> = [
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
    render: (text: number) => formatHeartRate(text),
  },
  {
    title: 'To',
    dataIndex: 'max',
    key: 'max',
    render: (text: number) => formatHeartRate(text),
  },
];
