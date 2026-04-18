import { useState } from 'react';
import { Layout, Button, Avatar, Dropdown } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth.api';
import { ROLE_LABELS } from '@/constants';

const { Header, Content } = Layout;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const { mutate: logout } = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearAuth();
      void navigate('/login');
    },
  });

  const dropdownItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Chiqish',
      danger: true,
      onClick: () => logout(),
    },
  ];

  const siderWidth = collapsed ? 80 : 260;

  return (
    <Layout className='min-h-screen'>
      <Sidebar collapsed={collapsed} />
      <Layout
        style={{ marginLeft: siderWidth, transition: 'margin-left 0.2s' }}
      >
        <Header className='px-0 bg-white flex items-center justify-between pr-4 border-b border-gray-200 sticky top-0 z-100 w-full'>
          <Button
            type='text'
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className='text-base w-16 h-16'
          />
          <Dropdown
            menu={{ items: dropdownItems }}
            placement='bottomRight'
            arrow
          >
            <div className='flex items-center gap-2 cursor-pointer select-none'>
              <div className='text-right hidden sm:block'>
                <div className='text-sm font-medium leading-tight'>
                  {user?.fullName ?? user?.username}
                </div>
                <div className='text-xs text-gray-400 leading-tight'>
                  {user?.role ? ROLE_LABELS[user.role] : ''}
                </div>
              </div>
              <Avatar icon={<UserOutlined />} className='bg-[#1677ff]' />
            </div>
          </Dropdown>
        </Header>
        <Content className='my-6 mx-4 p-6 min-h-70 bg-white rounded-lg'>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
