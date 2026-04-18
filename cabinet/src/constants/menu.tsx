import {
  FileTextOutlined,
  GlobalOutlined,
  TeamOutlined,
  AppstoreOutlined,
  WarningOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import { ROLES } from '@/types';
import type { UserRole } from '@/types';

export interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  roles: UserRole[] | null;
}

const iconStyle = { fontSize: 18 };

export const menuItems: MenuItem[] = [
  {
    key: '/applications',
    icon: <FileTextOutlined style={iconStyle} />,
    label: 'Arizalar',
    roles: null,
  },
  {
    key: '/geographic-objects',
    icon: <GlobalOutlined style={iconStyle} />,
    label: 'Reyestr',
    roles: null,
  },
  {
    key: '/admin/users',
    icon: <TeamOutlined style={iconStyle} />,
    label: 'Foydalanuvchilar',
    roles: [ROLES.ADMIN],
  },
  {
    key: '/admin/object-types',
    icon: <AppstoreOutlined style={iconStyle} />,
    label: 'Obyekt turlari',
    roles: [ROLES.ADMIN],
  },
  {
    key: '/non-compliant',
    icon: <WarningOutlined style={iconStyle} />,
    label: 'Nomuvofiqlar',
    roles: [ROLES.KADASTR_AGENCY, ROLES.DKP_CENTRAL, ROLES.ADMIN],
  },
  {
    key: '/map',
    icon: <CompassOutlined style={iconStyle} />,
    label: 'Ochiq xarita',
    roles: [ROLES.ADMIN],
  },
];
