import Typography from '@ui/typography';

const { Text } = Typography;

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Text variant="h1">You should not be able to be here :O</Text>
    </div>
  );
}
