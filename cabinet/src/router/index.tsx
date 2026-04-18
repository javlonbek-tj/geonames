import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import ProtectedRoute from '@/components/ProtectedRoute';
import GuestRoute from '@/components/GuestRoute';
import AppLayout from '@/components/layout/AppLayout';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const ApplicationsPage = lazy(() => import('@/pages/applications/ApplicationsPage'));
const ApplicationDetailPage = lazy(() => import('@/pages/applications/ApplicationDetailPage'));
const CreateGeographicObjectPage = lazy(() => import('@/pages/geographic-objects/CreateGeographicObjectPage'));
const RegistryPage = lazy(() => import('@/pages/geographic-objects/RegistryPage'));
const GeographicObjectDetailPage = lazy(() => import('@/pages/geographic-objects/GeographicObjectDetailPage'));
const UsersPage = lazy(() => import('@/pages/admin/UsersPage'));
const ObjectTypesPage = lazy(() => import('@/pages/admin/ObjectTypesPage'));
const NonCompliantPage = lazy(() => import('@/pages/non-compliant/NonCompliantPage'));
const MapPage = lazy(() => import('@/pages/map/MapPage'));

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
          { path: '/', element: <Navigate to='/applications' replace /> },
          { path: '/applications', element: wrap(ApplicationsPage) },
          { path: '/applications/:id', element: wrap(ApplicationDetailPage) },
          { path: '/geographic-objects', element: wrap(RegistryPage) },
          { path: '/geographic-objects/:id', element: wrap(GeographicObjectDetailPage) },
          { path: '/geographic-objects/create', element: wrap(CreateGeographicObjectPage) },
          { path: '/admin/users', element: wrap(UsersPage) },
          { path: '/admin/object-types', element: wrap(ObjectTypesPage) },
          { path: '/non-compliant', element: wrap(NonCompliantPage) },
          { path: '/map', element: wrap(MapPage) },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
