/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout, AdminRoute } from './Layout';
import { LandingPage } from './components/LandingPage';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Quiz } from './components/Quiz';
import { ActivityLogs } from './components/ActivityLogs';
import { AllResponses } from './components/AllResponses';
import { ResultDetail } from './components/ResultDetail';

function AppRoutes() {
  const { user, profile, loading, selectedRole, isAdminVerified } = useAuth();

  if (loading) return null;

  // Determine if we need to show landing page for role selection
  const needsRoleSelection = user && profile?.role === 'admin' && (!selectedRole || (selectedRole === 'admin' && !isAdminVerified));

  return (
    <Routes>
      <Route path="/login" element={(!user || needsRoleSelection) ? <LandingPage /> : <Navigate to="/" />} />
      
      <Route element={<Layout />}>
        <Route path="/" element={
          (!user || needsRoleSelection) 
            ? <Navigate to="/login" /> 
            : (selectedRole === 'admin' ? <Navigate to="/admin" /> : <UserDashboard />)
        } />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/results/:id" element={<ResultDetail />} />
        
        {/* Admin only routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/logs" element={
          <AdminRoute>
            <ActivityLogs />
          </AdminRoute>
        } />
        <Route path="/admin/responses" element={
          <AdminRoute>
            <AllResponses />
          </AdminRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
