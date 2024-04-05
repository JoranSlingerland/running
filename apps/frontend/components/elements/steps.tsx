import { Separator } from '@ui/separator';
import { Text } from '@ui/typography';

// Props
interface Steps {
  title: string;
  status: string;
  icon: JSX.Element;
  description?: string;
}

interface Props {
  steps: Steps[];
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

export default function Steps({
  steps,
  className,
  orientation = 'vertical',
}: Props) {
  return (
    <div
      className={`${className} ${orientation === 'horizontal' ? 'flex' : ''}`}
    >
      {steps.map((step, index) => {
        return (
          <div key={index}>
            <div className="flex items-center">
              <div className="flex items-center justify-center">
                <div
                  className={`flex items-center justify-center rounded-full ${
                    step.status === 'process'
                      ? 'bg-blue-500'
                      : step.status === 'finish'
                        ? 'bg-green-500'
                        : step.status === 'error'
                          ? 'bg-red-500'
                          : 'bg-gray-500'
                  } size-8`}
                >
                  {step.icon}
                </div>
              </div>
              <div className="ml-2 flex flex-col">
                <Text>{step.title}</Text>
                {step.description && (
                  <Text size="small" type="muted">
                    {step.description}
                  </Text>
                )}
              </div>
              {index !== steps.length - 1 && orientation === 'horizontal' && (
                <Separator orientation="horizontal" className="mx-4 w-8" />
              )}
            </div>
            {index !== steps.length - 1 && orientation === 'vertical' && (
              <Separator orientation="vertical" className="mx-4 my-2 h-8" />
            )}
          </div>
        );
      })}
    </div>
  );
}
