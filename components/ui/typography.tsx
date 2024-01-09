type Variants = 'h1' | 'h2' | 'h3' | 'h4' | 'p';
type Size = 'default' | 'small' | 'large';
type Type = 'default' | 'code' | 'muted' | 'blockquote';

interface CustomTextProps {
  variant?: Variants;
  size?: Size;
  type?: Type;
  children: React.ReactNode;
  className?: string;
}

interface CustomLinkProps extends React.ComponentPropsWithoutRef<'a'> {
  size?: Size;
  type?: Type;
  className?: string;
}

function getSizeClass(size: Size): string {
  switch (size) {
    case 'small':
      return 'text-sm font-medium leading-none';
    case 'large':
      return 'text-lg font-semibold';
    default:
      return '';
  }
}

function getTypeClass(type: Type): string {
  switch (type) {
    case 'code':
      return 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono';
    case 'muted':
      return 'text-muted-foreground';
    case 'blockquote':
      return 'mt-6 border-l-2 pl-6 italic';
    default:
      return '';
  }
}

function CustomText({
  variant = 'p',
  size = 'default',
  type = 'default',
  children,
  className = '',
}: CustomTextProps): JSX.Element {
  let Component: Variants = 'p';
  let componentClass = '';
  let sizeClass = getSizeClass(size);
  let typeClass = getTypeClass(type);

  switch (variant) {
    case 'h1':
      Component = 'h1';
      componentClass =
        'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl';
      break;
    case 'h2':
      Component = 'h2';
      componentClass =
        'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0';
      break;
    case 'h3':
      Component = 'h3';
      componentClass = 'scroll-m-20 text-2xl font-semibold tracking-tight';
      break;
    case 'h4':
      Component = 'h4';
      componentClass = 'scroll-m-20 text-xl font-semibold tracking-tight';
      break;
    default:
      Component = 'p';
      componentClass = 'leading-7 [&:not(:first-child)]:mt-6';
  }

  return (
    <Component
      className={`${sizeClass} ${typeClass} ${className} ${componentClass}`}
    >
      {children}
    </Component>
  );
}

function CustomLink({
  children,
  size = 'default',
  type = 'default',
  className = '',
  ...props
}: CustomLinkProps): JSX.Element {
  const sizeClass = getSizeClass(size);
  const typeClass = getTypeClass(type);
  const linkClass = 'text-primary hover:text-blue-500';

  return (
    <a
      className={`${className} ${sizeClass} ${typeClass} ${linkClass}`}
      {...props}
    >
      {children}
    </a>
  );
}

const Typography = {
  Text: CustomText,
  Link: CustomLink,
};

export default Typography;
