import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from '../pages/Login/LoginPage';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { FleetPage } from '../pages/Fleet/FleetPage';
import { DriversPage } from '../pages/Drivers/DriversPage';
import { TripsPage } from '../pages/Trips/TripsPage';
import { MaintenancePage } from '../pages/Maintenance/MaintenancePage';
import { FuelExpensesPage } from '../pages/FuelExpenses/FuelExpensesPage';
import { AnalyticsPage } from '../pages/Analytics/AnalyticsPage';
import { SettingsPage } from '../pages/Settings/SettingsPage';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Route - Login Page */}
      <Route
        path="/"
        element={
          user ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      {/* Protected Routes under AppLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/fleet" element={<FleetPage />} />
        <Route path="/drivers" element={<DriversPage />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/fuel-expenses" element={<FuelExpensesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
