import { Layout, Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router';
import { useAuthStore } from '@/store/authStore';
import { menuItems } from '@/constants/menu';
import type { UserRole } from '@/types';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const visibleItems = menuItems
    .filter(
      (item) => !item.roles || item.roles.includes(user?.role as UserRole),
    )
    .map(({ key, icon, label }) => ({ key, icon, label }));

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={260}
      className='bg-white border-r border-gray-200 fixed h-screen overflow-auto left-0 top-0 bottom-0'
    >
      <div className='h-16 flex items-center justify-center overflow-hidden border-b border-gray-200'>
        <span className='text-gray-800 font-bold tracking-widest uppercase text-sm truncate px-4'>
          {collapsed ? 'GN' : 'Geonomlar'}
        </span>
      </div>
      <Menu
        mode='inline'
        selectedKeys={[location.pathname]}
        onClick={({ key }) => void navigate(key)}
        items={visibleItems}
        className='border-none'
      />
    </Sider>
  );
}
