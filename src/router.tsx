import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/pages/Dashboard';
import { CreateCRA } from '@/pages/CreateCRA';
import { EditCRA } from '@/pages/EditCRA';
import { PreviewCRA } from '@/pages/PreviewCRA';
import { Companies } from '@/pages/Companies';
import { CreateCompany } from '@/pages/CreateCompany';
import { EditCompany } from '@/pages/EditCompany';
import { NotFound } from '@/pages/NotFound';
import { ErrorBoundary } from '@/pages/ErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'cra/new',
        element: <CreateCRA />,
      },
      {
        path: 'cra/:id/edit',
        element: <EditCRA />,
      },
      {
        path: 'cra/:id/preview',
        element: <PreviewCRA />,
      },
      {
        path: 'companies',
        element: <Companies />,
      },
      {
        path: 'companies/new',
        element: <CreateCompany />,
      },
      {
        path: 'companies/:id/edit',
        element: <EditCompany />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
