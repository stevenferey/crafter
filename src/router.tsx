import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Landing } from '@/pages/Landing';
import { Dashboard } from '@/pages/Dashboard';
import { CreateCRA } from '@/pages/CreateCRA';
import { EditCRA } from '@/pages/EditCRA';
import { PreviewCRA } from '@/pages/PreviewCRA';
import { Companies } from '@/pages/Companies';
import { CreateCompany } from '@/pages/CreateCompany';
import { EditCompany } from '@/pages/EditCompany';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { ResetPassword } from '@/pages/ResetPassword';
import { VerifyEmail } from '@/pages/VerifyEmail';
import { AuthCallback } from '@/pages/AuthCallback';
import { NotFound } from '@/pages/NotFound';
import { ErrorBoundary } from '@/pages/ErrorBoundary';

export const router = createBrowserRouter([
  // Routes publiques
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password/:token',
    element: <ResetPassword />,
  },
  {
    path: '/verify-email/:token',
    element: <VerifyEmail />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },

  // Routes protégées (nécessitent authentification)
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
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
