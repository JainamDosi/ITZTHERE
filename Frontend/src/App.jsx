import React, { Suspense, lazy } from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import './index.css'
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

const Windo_landing = lazy(() => import('./pages/Windo_landing'))
const ITZTHERE_ = lazy(() => import('./pages/ITZTHERE'))



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ITZTHERE_ />} />
        <Route path="/windo" element={<Windo_landing/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        //Company-Admin Routes
        <Route path="/main" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="upload" element={<UploadFile/>} />
          <Route path="requests" element={<ManageRequests/>} />
        </Route>
        //Company-Employee Routes
        <Route path="/employee" element={<MainLayout_Employee />}>
          <Route index element={<Dashboard_Employee />} />
          <Route path="dashboard" element={<Dashboard_Employee />} />
          <Route path="request-access" element={<Request_Employee />} />
          <Route path="upload" element={<UploadFile/>} />
        </Route>

      </Routes>
    </BrowserRouter>
  )


}

export default App;
