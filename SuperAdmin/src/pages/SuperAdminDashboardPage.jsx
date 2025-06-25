import React from 'react';
import SuperAdminSidebar from '../components/SuperAdminSidebar';
import SuperAdminHeader from '../components/SuperAdminHeader';
import SuperAdminDashboardCards from '../components/SuperAdminDashboardCards';

const SuperAdminDashboardPage = () => {
  return (
    <div className="flex flex-col h-screen bg-white/50 overflow-hidden">
      {/* Header */}
      <div className="h-16 shrink-0">
        <SuperAdminHeader />
      </div>

      {/* Sidebar + Main */}
      <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-y-hidden pt-4">
       
        <div className="w-80 h-full overflow-y-scroll scrollbar-hide bg-white pb-2">
          <SuperAdminSidebar />
        </div>

        {/* Main content: scrollable vertically */}
        <div className="flex-1 h-full p-4">
          {/* Add main content here */}
          <SuperAdminDashboardCards />
          
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboardPage;
