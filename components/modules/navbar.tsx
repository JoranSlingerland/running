import {
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { Menu, Typography, Drawer } from 'antd';
import { useEffect, useState } from 'react';
import type { MenuProps } from 'antd/es/menu';
import { MenuOutlined } from '@ant-design/icons';
import { useProps } from '../hooks/useProps';

type MenuItem = Required<MenuProps>['items'][number];

const { Link } = Typography;

export default function App() {
  // const setup
  const { userInfo } = useProps();
  const [current, setCurrent] = useState('settings');
  const authenticated = () => {
    return (
      userInfo?.clientPrincipal?.userRoles.includes('authenticated') || false
    );
  };
  const [drawerVisible, setDrawerVisible] = useState(false);

  // useEffect
  useEffect(() => {
    setCurrent(window.location.pathname);
  }, []);

  const navItems: MenuItem[] = [
    {
      key: '/authenticated/calendar/',
      icon: <CalendarOutlined />,
      label: (
        <span>
          <a className="" href="/authenticated/calendar/"></a>
          <p className="inline-block">calendar</p>
        </span>
      ),
    },
  ];

  const userMenu: MenuItem[] = [
    {
      key: 'SubMenu',
      icon: <UserOutlined />,
      label: (
        <p className="hidden sm:inline-block">
          {userInfo?.clientPrincipal?.userDetails || ''}
        </p>
      ),
      className: 'float-right hidden sm:inline-block',
      disabled: !authenticated(),
      children: [
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: <a href="/authenticated/settings/">Settings</a>,
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: (
            <a
              href="/.auth/logout?post_logout_redirect_uri=/"
              onClick={() => {
                sessionStorage.clear();
              }}
            >
              Logout
            </a>
          ),
        },
      ],
    },
  ];

  const openMenu: MenuItem[] = [
    {
      key: 'openMenu',
      onClick: () => {
        setDrawerVisible(true);
      },
      icon: <MenuOutlined />,
    },
  ];

  // Menu items
  const topMenuLarge: MenuItem[] = [...userMenu, ...navItems];
  const topMenuSmall: MenuItem[] = [...userMenu, ...openMenu];

  return (
    <>
      <Menu
        selectedKeys={[current]}
        mode="horizontal"
        items={topMenuLarge}
        className="hidden sm:block"
      />
      <Menu
        selectedKeys={[current]}
        mode="horizontal"
        items={topMenuSmall}
        className="sm:hidden block"
      />
      <Drawer
        open={drawerVisible}
        closable={false}
        placement="left"
        onClose={() => {
          setDrawerVisible(false);
        }}
        bodyStyle={{ padding: 0, paddingTop: 0 }}
        width={200}
        footer={
          <div className="text-center">
            <Link
              type="secondary"
              href="/.auth/logout?post_logout_redirect_uri=/"
              onClick={() => {
                sessionStorage.clear();
              }}
            >
              Logout
            </Link>
          </div>
        }
      >
        <Menu items={navItems} selectedKeys={[current]} className="border-0" />
      </Drawer>
    </>
  );
}
