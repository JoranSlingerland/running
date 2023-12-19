import AntdCalendar from '../../components/elements/calendar';
import { useActivities } from '../../components/services/data/activities';

export default function App() {
  const { data: activitiesData, isLoading: activitiesIsLoading } =
    useActivities({});

  return <AntdCalendar data={activitiesData} isLoading={activitiesIsLoading} />;
}
