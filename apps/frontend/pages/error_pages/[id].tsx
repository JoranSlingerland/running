import { Separator } from '@ui/separator';
import { Text, Title } from '@ui/typography';

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
    <div className="flex h-screen w-full flex-row items-center justify-center">
      <Title variant="h1">{errorcode.errorcode}</Title>
      <Separator orientation="vertical" className="mx-4 h-16" />
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
