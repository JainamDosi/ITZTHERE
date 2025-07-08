
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ITZTHERE from './pages/ITZTHERE'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Company-Admin/Dashboard'
import UserManagement from './pages/Company-Admin/UserManagement'
import MainLayout from './pages/Company-Admin/MainLayout'
import UploadFile from './pages/Company-Admin/UploadFile'
import ManageRequests from './pages/Company-Admin/ManageRequests'
import MainLayout_Employee from './pages/Company-Employee/MainLayout'
import Dashboard_Employee from './pages/Company-Employee/Dashboard_Employee'
import Request_Employee from './pages/Company-Employee/Request_Employee'
import MainLayout_Client from './pages/Client/MainLayout'
import Dashboard_Client from './pages/Client/Dashboard_Client'
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import FolderFiles from './pages/Company-Admin/FolderFiles';
import EmployeeFolderPage from './pages/Company-Employee/EmployeeFolderPage';
import ClientFolderFiles from './pages/Client/ClientFolderFiles';
import MainLayout_Individual from './pages/Individual/MainLayout';
import Dashboard_Individual from './pages/Individual/Dashboard_Individual';
import IndividualFolderPage from './pages/Individual/IndividualFolderFiles';

import SuperAdminDashboardPage from './pages/SuperAdmin/SuperAdminDashboardPage';
import CompaniesPage from './pages/SuperAdmin/CompaniesPage';
import ClientsPage from './pages/SuperAdmin/ClientsPage';
import UsersPage from './pages/SuperAdmin/UsersPage';
import ManageRequestsPage from './pages/SuperAdmin/ManageRequestsPage';

const Windo_landing = lazy(() => import('./pages/Windo_landing'))
const ITZTHERE_ = lazy(() => import('./pages/ITZTHERE'))



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="bottom-left" autoClose={2000} />
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<ITZTHERE_ />} />
            <Route path="/windo" element={<Windo_landing />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Company-Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['company-admin']} />}>
              <Route path="/main" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="user-management" element={<UserManagement />} />
                <Route path="upload" element={<UploadFile />} />
                <Route path="requests" element={<ManageRequests />} />
                <Route path="folder/:folderId" element={<FolderFiles />} />
              </Route>
            </Route>

            {/* Company-Employee Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
              <Route path="/employee" element={<MainLayout_Employee />}>
                <Route index element={<Dashboard_Employee />} />
                <Route path="dashboard" element={<Dashboard_Employee />} />
                <Route path="request-access" element={<Request_Employee />} />
                <Route path="upload" element={<UploadFile />} />
                <Route path="folder/:folderId" element={<EmployeeFolderPage />} />
              </Route>
            </Route>

            {/* Client Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['client']} />}>
              <Route path="/client" element={<MainLayout_Client />}>
                <Route index element={<Dashboard_Client />} />
                <Route path="dashboard" element={<Dashboard_Client />} />
                <Route path="folder/:folderId" element={<ClientFolderFiles />} />
              </Route>
            </Route>
      
            {/* Individual Protected Routes */} 
            <Route element={<ProtectedRoute allowedRoles={['Individual']} />}>
                <Route path="/individual" element={<MainLayout_Individual />}>
                <Route index element={<Dashboard_Individual />} />
                <Route path="dashboard" element={<Dashboard_Individual />} />
                <Route path="upload" element={<UploadFile />} />
                <Route path="folder/:folderId" element={<IndividualFolderPage />} />
            </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
                  <Route path="/superadmin/dashboard" element={<SuperAdminDashboardPage />} />
                  <Route path="/superadmin/companies" element={<CompaniesPage />} />
                  <Route path="/superadmin/clients" element={<ClientsPage />} />
                  <Route path="/superadmin/users" element={<UsersPage />} />
                  <Route path="/superadmin/requests" element={<ManageRequestsPage />} />
            </Route>


          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
