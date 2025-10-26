import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/pages/Dashboard';
import { CreateCRA } from '@/pages/CreateCRA';
import { EditCRA } from '@/pages/EditCRA';
import { PreviewCRA } from '@/pages/PreviewCRA';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
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
    ],
  },
]);
