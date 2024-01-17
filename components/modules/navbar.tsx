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
  return `flex items-center text-sm font-medium transition-colors ${
    key === current
      ? 'bg-slate-400 rounded-xl bg-opacity-10 p-1 text-primary'
      : 'hover:bg-slate-400 hover:bg-opacity-10 rounded-xl p-1 hover:text-primary'
  }`;
}

function MainNav({
  className,
  current,
  ...props
}: React.HTMLAttributes<HTMLElement> & { current: string }) {
  return (
    <nav className={cn('flex items-center space-x-4', className)} {...props}>
      {menuItems.map((item) => (
        <Link
          key={item.key}
          href={item.key}
          className={getLinkClassName(item.key, current)}
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
}: {
  userInfo: UserInfo | undefined;
  isAuthenticated: boolean;
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
            <Link key={item.key} href={item.key}>
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
        <Link href={logOut.key}>
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
}: {
  current: string;
  className?: string;
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
        <nav className="flex flex-col">
          {menuItems.map((item) => (
            <Link
              key={item.key}
              href={item.key}
              className={getLinkClassName(item.key, current)}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </Link>
          ))}
          <Separator />
          <Link
            href={logOut.key}
            className={getLinkClassName(logOut.key, current)}
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
      userInfo?.clientPrincipal?.userRoles.includes('authenticated') || false
    );
  };

  useEffect(() => {
    setCurrent(window.location.pathname);
  }, []);

  return (
    <div className="border-b">
      <div className="mx-4 flex h-12 items-center ">
        <MainNav className="hidden sm:block" current={current} />
        <SheetNav className="sm:hidden block" current={current} />
        <div className="ml-auto flex items-center space-x-4">
          <UserNav userInfo={userInfo} isAuthenticated={isAuthenticated()} />
        </div>
      </div>
    </div>
  );
}
