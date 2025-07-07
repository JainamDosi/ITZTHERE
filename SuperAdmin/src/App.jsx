import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import SuperAdminDashboardPage from './pages/SuperAdminDashboardPage';
import CompaniesPage from './pages/CompaniesPage';
import ClientsPage from './pages/ClientsPage';
import PersonalsPage from './pages/PersonalsPage';
import UsersPage from './pages/UsersPage';
import ManageRequestsPage from './pages/ManageRequestsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/superadmin/dashboard" />} />

        {/* Sidebar linked routes */}
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboardPage />} />
        <Route path="/superadmin/companies" element={<CompaniesPage />} />
        <Route path="/superadmin/clients" element={<ClientsPage />} />
        <Route path="/superadmin/users" element={<UsersPage />} />
        
        
        <Route path="/superadmin/requests" element={<ManageRequestsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
