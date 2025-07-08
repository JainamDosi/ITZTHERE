import React from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import SuperAdminHeader from '../../components/SuperAdminHeader';
import SuperAdminCompactDashboard from '../../components/SuperAdminCompactDashboard';

const CompaniesPage = () => {
  return (
    <div className="flex flex-col h-screen bg-white/50 overflow-hidden">
      <div className="h-16 shrink-0">
        <SuperAdminHeader />
      </div>

      <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-y-hidden pt-4">
        <div className="w-80 h-full overflow-y-scroll scrollbar-hide bg-white pb-2">
          <SuperAdminSidebar />
        </div>

        <div className="flex-1 h-full overflow-y-auto">
          <SuperAdminCompactDashboard />
        </div>
      </div>
    </div>
  );
};

export default CompaniesPage;
