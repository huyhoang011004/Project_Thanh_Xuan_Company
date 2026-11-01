import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import { RequireAuth } from './RequireAuth';
import { LoginPage } from '@/features/auth/LoginPage';
import { AdminShellComponent } from '@/components/layout/AdminShellComponent';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ArticlesListPage } from '@/features/articles/ArticlesListPage';
import { ArticleEditorPage } from '@/features/articles/ArticleEditorPage';
import { CategoriesListPage } from '@/features/categories/CategoriesListPage';
import { ContactsListPage } from '@/features/contacts/ContactsListPage';
import { CrmListPage } from '@/features/crm/CrmListPage';
import { OrdersListPage } from '@/features/orders/OrdersListPage';
import { GeneralSettingsPage } from '@/features/settings/GeneralSettingsPage';
import { UsersListPage } from '@/features/users/UsersListPage';

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
            element: <ArticlesListPage />,
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
            element: <CategoriesListPage />,
          },
          {
            path: 'contacts',
            element: <ContactsListPage />,
          },
          {
            path: 'crm',
            element: <CrmListPage />,
          },
          {
            path: 'orders',
            element: <OrdersListPage />,
          },
          {
            path: 'settings',
            element: <GeneralSettingsPage />,
          },
          {
            path: 'users',
            element: <UsersListPage />,
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
