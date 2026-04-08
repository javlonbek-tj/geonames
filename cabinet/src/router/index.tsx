import { createBrowserRouter, RouterProvider } from 'react-router';
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import ProtectedRoute from '@/components/ProtectedRoute';
import GuestRoute from '@/components/GuestRoute';
import AppLayout from '@/components/layout/AppLayout';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const ApplicationsPage = lazy(() => import('@/pages/applications/ApplicationsPage'));
const ApplicationDetailPage = lazy(() => import('@/pages/applications/ApplicationDetailPage'));
const CreateGeographicObjectPage = lazy(() => import('@/pages/geographic-objects/CreateGeographicObjectPage'));

const fallback = (
  <div className='flex h-screen items-center justify-center'>
    <Spin size='large' />
  </div>
);

const wrap = (Component: React.ComponentType) => (
  <Suspense fallback={fallback}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      { path: '/login', element: wrap(LoginPage) },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: wrap(ApplicationsPage) },
          { path: '/applications', element: wrap(ApplicationsPage) },
          { path: '/applications/:id', element: wrap(ApplicationDetailPage) },
          { path: '/geographic-objects/create', element: wrap(CreateGeographicObjectPage) },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
