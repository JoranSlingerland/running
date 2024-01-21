import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { Icon } from '@elements/icon';
import { useProps } from '@hooks/useProps';
import { Avatar, AvatarFallback } from '@ui/avatar';
import { Button } from '@ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ui/dropdown-menu';
import { Separator } from '@ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@ui/sheet';
import { cn } from '@utils/shadcn';

const menuItems = [
  {
    key: '/authenticated/calendar/',
    icon: <Icon icon={'calendar_month'} />,
    label: 'Calendar',
  },
];

const userMenuItems = [
  {
    key: '/authenticated/settings/',
    icon: <Icon icon={'settings'} />,
    label: 'Settings',
  },
];

const logOut = {
  key: '/.auth/logout?post_logout_redirect_uri=/',
  icon: <Icon icon={'logout'} />,
  label: 'Logout',
  onclick: () => {
    sessionStorage.clear();
  },
};

function getLinkClassName(key: string, current: string) {
  return `flex items-center text-sm font-medium transition-colors rounded-xl h-9 p-2 ${
    key === current
      ? 'bg-zinc-100 text-zinc-900 shadow-sm hover:bg-zinc-100/80 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800/80'
      : 'hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
  }`;
}

function MainNav({
  className,
  current,
  setCurrent,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  current: string;
  setCurrent: (current: string) => void;
}) {
  return (
    <nav className={cn('items-center space-x-2', className)} {...props}>
      {menuItems.map((item) => (
        <Link
          key={item.key}
          href={item.key}
          className={getLinkClassName(item.key, current)}
          onClick={() => setCurrent(item.key)}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function UserNav({
  userInfo,
  isAuthenticated,
  setCurrent,
}: {
  userInfo: UserInfo | undefined;
  isAuthenticated: boolean;
  setCurrent: (current: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8"
          disabled={!isAuthenticated}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {(userInfo?.clientPrincipal?.userDetails || '').split(' ')[0][0]}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuGroup>
          {userMenuItems.map((item) => (
            <Link
              key={item.key}
              href={item.key}
              onClick={() => setCurrent(item.key)}
            >
              <DropdownMenuItem
                className={'text-sm font-medium transition-colors'}
              >
                <div className="flex items-center">
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </div>
              </DropdownMenuItem>
            </Link>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <Link href={logOut.key} onClick={() => setCurrent(logOut.key)}>
          <DropdownMenuItem>
            <div className="text-sm font-medium flex items-center">
              {logOut.icon}
              <span className="ml-2">{logOut.label}</span>
            </div>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SheetNav({
  current,
  className,
  setCurrent,
}: {
  current: string;
  className?: string;
  setCurrent: (current: string) => void;
}) {
  return (
    <Sheet>
      <SheetTrigger className={`items-center ${className}`}>
        <Icon icon="menu" />
      </SheetTrigger>
      <SheetContent side={'left'}>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.key}
              href={item.key}
              className={getLinkClassName(item.key, current)}
              onClick={() => setCurrent(item.key)}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </Link>
          ))}
          <Separator />
          <Link
            href={logOut.key}
            className={getLinkClassName(logOut.key, current)}
            onClick={() => setCurrent(logOut.key)}
          >
            {logOut.icon}
            <span className="ml-2">{logOut.label}</span>
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default function App() {
  const { userInfo } = useProps();
  const [current, setCurrent] = useState('');
  const isAuthenticated = () => {
    return (
      userInfo?.data?.clientPrincipal?.userRoles.includes('authenticated') ||
      false
    );
  };

  useEffect(() => {
    setCurrent(window.location.pathname);
  }, []);

  return (
    <div className="border-b">
      <div className="mx-4 flex h-12 items-center ">
        <MainNav
          className="hidden sm:flex"
          current={current}
          setCurrent={setCurrent}
        />
        <SheetNav
          className="sm:hidden"
          current={current}
          setCurrent={setCurrent}
        />
        <div className="ml-auto flex items-center space-x-4">
          <UserNav
            userInfo={userInfo?.data}
            isAuthenticated={isAuthenticated()}
            setCurrent={setCurrent}
          />
        </div>
      </div>
    </div>
  );
}
