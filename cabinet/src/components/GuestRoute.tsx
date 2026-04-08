import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/store/authStore';

export default function GuestRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return accessToken ? <Navigate to='/' replace /> : <Outlet />;
}
