import Typography from '@ui/typography';

const { Title } = Typography;

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Title variant="h1">You should not be able to be here :O</Title>
    </div>
  );
}
