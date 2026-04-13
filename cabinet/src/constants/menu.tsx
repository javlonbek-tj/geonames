import {
  FileTextOutlined,
  GlobalOutlined,
  TeamOutlined,
  AppstoreOutlined,
  WarningOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import type { UserRole } from '@/types';

export interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  roles: UserRole[] | null;
}

export const menuItems: MenuItem[] = [
  {
    key: '/applications',
    icon: <FileTextOutlined />,
    label: 'Arizalar',
    roles: null,
  },
  {
    key: '/geographic-objects',
    icon: <GlobalOutlined />,
    label: 'Reyestr',
    roles: null,
  },
  {
    key: '/admin/users',
    icon: <TeamOutlined />,
    label: 'Foydalanuvchilar',
    roles: ['admin'],
  },
  {
    key: '/admin/object-types',
    icon: <AppstoreOutlined />,
    label: "Ob'yekt turlari",
    roles: ['admin'],
  },
  {
    key: '/non-compliant',
    icon: <WarningOutlined />,
    label: 'Nomuvofiqlar',
    roles: ['kadastr_agency', 'dkp_central', 'admin'],
  },
  {
    key: '/map',
    icon: <CompassOutlined />,
    label: 'Ochiq xarita',
    roles: ['admin'],
  },
];
