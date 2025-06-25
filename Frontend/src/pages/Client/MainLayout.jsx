// layout/MainLayout.jsx
import React from "react";
import Header from "../../components/Header";
import { Outlet } from "react-router-dom";
import Sidebar_Client from "../../components/Sidebar_Client";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* Header */}
      <Header />

      {/* Body section with sidebar and main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        
          <Sidebar_Client />
        

        {/* Main Content */}
        <main className="flex-1 mt-24 px-8">
          <Outlet /> {/* Render routed pages here */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
