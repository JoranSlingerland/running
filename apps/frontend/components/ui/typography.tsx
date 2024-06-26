import NextLink from 'next/link';

type Size = 'default' | 'small' | 'large';
type Type = 'default' | 'code' | 'muted' | 'blockquote';

interface CustomTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: Size;
  type?: Type;
  italic?: boolean;
  bold?: boolean;
}

interface CustomTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4';
  italic?: boolean;
  bold?: boolean;
}

interface CustomLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  size?: Size;
  type?: Type;
  italic?: boolean;
  bold?: boolean;
  children: React.ReactNode;
  href: string;
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

const Text: React.FC<CustomTextProps> = ({
  size = 'default',
  type = 'default',
  italic = false,
  bold = false,
  className = '',
  ...props
}) => {
  const sizeClass = getSizeClass(size);
  const typeClass = getTypeClass(type);
  const italicClass = italic ? 'italic' : '';
  // eslint-disable-next-line sonarjs/no-duplicate-string
  const boldClass = bold ? 'font-semibold' : '';

  return (
    <p
      className={`${sizeClass} ${typeClass} ${className} ${italicClass} ${boldClass} `}
      {...props}
    />
  );
};

const Title: React.FC<CustomTitleProps> = ({
  variant = 'h1',
  className = '',
  italic = false,
  bold = false,
  ...props
}) => {
  let componentClass = '';

  switch (variant) {
    case 'h1':
      componentClass =
        'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl';
      break;
    case 'h2':
      componentClass =
        'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0';
      break;
    case 'h3':
      componentClass = 'scroll-m-20 text-2xl font-semibold tracking-tight';
      break;
    case 'h4':
      componentClass = 'scroll-m-20 text-xl font-semibold tracking-tight';
      break;
  }
  const italicClass = italic ? 'italic' : '';
  const boldClass = bold ? 'font-semibold' : '';

  const Component = variant;

  return (
    <Component
      className={`${className} ${componentClass} ${italicClass} ${boldClass}`}
      {...props}
    />
  );
};

const Link: React.FC<CustomLinkProps> = ({
  children,
  size = 'default',
  type = 'default',
  italic = false,
  bold = false,
  className = '',
  ...props
}) => {
  const sizeClass = getSizeClass(size);
  const typeClass = getTypeClass(type);
  const linkClass = 'text-primary hover:text-blue-500';
  const italicClass = italic ? 'italic' : '';
  const boldClass = bold ? 'font-semibold' : '';

  return (
    <NextLink
      className={`${className} ${sizeClass} ${typeClass} ${linkClass} ${italicClass} ${boldClass}`}
      {...props}
    >
      {children}
    </NextLink>
  );
};

export { Text, Link, Title };
