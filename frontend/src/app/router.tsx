import React from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../components/layout/PublicLayout';
import { AuthLayout } from '../features/auth/AuthLayout';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute, PublicOnlyRoute } from './route-guards';

// Public & Auth Pages
import { LandingPage } from '../features/landing/LandingPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { NotFoundPage } from '../features/common/NotFoundPage';

// Operational Dashboard & Application Pages
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { RegionsPage } from '../features/regions/RegionsPage';
import { RegionDetailsPage } from '../features/regions/RegionDetailsPage';
import { AlertsPage } from '../features/alerts/AlertsPage';
import { AlertDetailsPage } from '../features/alerts/AlertDetailsPage';
import { InvestigationsPage } from '../features/investigations/InvestigationsPage';
import { InvestigationDetailsPage } from '../features/investigations/InvestigationDetailsPage';
import { DataSourcesPage } from '../features/data-sources/DataSourcesPage';
import { ReportsPage } from '../features/reports/ReportsPage';
import { ProfilePage } from '../features/settings/ProfilePage';
import { SettingsPage } from '../features/settings/SettingsPage';

export const router = createHashRouter([
  // Public Landing Flow
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
    ],
  },

  // Public Authentication Flow
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: (
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: '/register',
        element: (
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
      },
    ],
  },

  // Operational Protected Application Flow
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/regions',
        element: <RegionsPage />,
      },
      {
        path: '/regions/:id',
        element: <RegionDetailsPage />,
      },
      {
        path: '/alerts',
        element: <AlertsPage />,
      },
      {
        path: '/alerts/:id',
        element: <AlertDetailsPage />,
      },
      {
        path: '/investigations',
        element: <InvestigationsPage />,
      },
      {
        path: '/investigations/:id',
        element: <InvestigationDetailsPage />,
      },
      {
        path: '/data-sources',
        element: <DataSourcesPage />,
      },
      {
        path: '/reports',
        element: <ReportsPage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
  },

  // 404 Catch-All
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
