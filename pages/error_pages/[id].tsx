import { Separator } from '@ui/separator';
import Typography from '@ui/typography';

const { Text } = Typography;

export async function getStaticPaths() {
  return {
    paths: ['401', '403', '404'].map((errorcode) => ({
      params: { id: errorcode },
    })),
    fallback: false,
  };
}

export async function getStaticProps(context: { params: { id: string } }) {
  return {
    props: { errorcode: context.params.id },
  };
}

export default function DynamicPage(errorcode: { errorcode: string }) {
  return (
    <div className="flex flex-row items-center justify-center w-full h-screen">
      <Text size="large" variant="h1">
        {errorcode.errorcode}
      </Text>
      <Separator orientation="vertical" className="h-16 mx-4" />
      <Text size="large">{errorText(errorcode)}</Text>
    </div>
  );
}

function errorText({ errorcode }: { errorcode: string }): string {
  switch (errorcode) {
    case '401':
      return 'You are not authorized to view this page';
    case '403':
      return 'You do not have permissions to view this page';
    case '404':
      return 'The page you are looking for does not exist';
    default:
      return 'An error occurred';
  }
}
