import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import { RequireAuth } from './RequireAuth';
import { LoginPage } from '@/features/auth/LoginPage';
import { AdminShellComponent } from '@/components/layout/AdminShellComponent';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ArticleManagerPage } from '@/features/articles/ArticleManagerPage';
import { ArticleEditorPage } from '@/features/articles/ArticleEditorPage';
import { CategoryManagerPage } from '@/features/categories/CategoryManagerPage';
import { ContactManagerPage } from '@/features/contacts/ContactManagerPage';
import { CrmManagerPage } from '@/features/crm/CrmManagerPage';
import { OrdersManagerPage } from '@/features/orders/OrdersManagerPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { AccountManagerPage } from '@/features/users/AccountManagerPage';
import { ZaloMarketingPage } from '@/features/zalo/ZaloMarketingPage';
import { EmailMarketingPage } from '@/features/email-marketing/EmailMarketingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: '',
        element: (
          <RequireAuth>
            <AdminShellComponent />
          </RequireAuth>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'articles',
            element: <ArticleManagerPage />,
          },
          {
            path: 'articles/new',
            element: <ArticleEditorPage />,
          },
          {
            path: 'articles/edit/:id',
            element: <ArticleEditorPage />,
          },
          {
            path: 'categories',
            element: <CategoryManagerPage />,
          },
          {
            path: 'contacts',
            element: <ContactManagerPage />,
          },
          {
            path: 'crm',
            element: <CrmManagerPage />,
          },
          {
            path: 'orders',
            element: <OrdersManagerPage />,
          },
          {
            path: 'zalo-marketing',
            element: <ZaloMarketingPage />,
          },
          {
            path: 'email-marketing',
            element: <EmailMarketingPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
          {
            path: 'users',
            element: <AccountManagerPage />,
          },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);
