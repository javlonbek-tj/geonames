import { createBrowserRouter, RouterProvider } from 'react-router';
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import PublicLayout from '@/components/layout/PublicLayout';

const HomePage = lazy(() => import('@/pages/HomePage'));
const DiscussionsPage = lazy(() => import('@/pages/DiscussionsPage'));
const DiscussionPage = lazy(() => import('@/pages/DiscussionPage'));
const RegistryPage = lazy(() => import('@/pages/RegistryPage'));
const TelegramLoginPage = lazy(() => import('@/pages/TelegramLoginPage'));
const GuidePage = lazy(() => import('@/pages/GuidePage'));

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
    element: <PublicLayout />,
    children: [
      { path: '/', element: wrap(HomePage) },
      { path: '/discussions', element: wrap(DiscussionsPage) },
      { path: '/discussions/:id', element: wrap(DiscussionPage) },
      { path: '/registry', element: wrap(RegistryPage) },
      { path: '/guide', element: wrap(GuidePage) },
      { path: '/login', element: wrap(TelegramLoginPage) },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
