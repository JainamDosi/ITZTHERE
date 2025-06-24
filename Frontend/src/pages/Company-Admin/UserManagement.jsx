import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { FaUserPlus } from "react-icons/fa";

function UserManagement() {
  const [selectedTab, setSelectedTab] = useState("Clients");

  return (
    <>
  
        <main className="flex-1 ">
          {/* Top Tabs and Action Button */}
          <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <TabButton label="Clients" active={selectedTab === "Clients"} onClick={() => setSelectedTab("Clients")} />
              <TabButton label="Employees" active={selectedTab === "Employees"} onClick={() => setSelectedTab("Employees")} />
            </div>
            <div className="flex items-center gap-4">
            <p>Add User</p>
            <button  className="p-2 rounded-md shadow bg-white text-pink-700 hover:bg-pink-50 transition">
                
              <FaUserPlus className="text-2xl"/>
            </button>
            </div>
          </div>

          {/* Content Box */}
          <div className="bg-white rounded-xl shadow h-[400px]" />
        </main>
    
    </>
  );
}

const TabButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2 rounded-md shadow text-sm font-semibold ${
      active ? "bg-pink-700 text-white" : "bg-gray-100 text-gray-800"
    }`}
  >
    {label}
  </button>
);

export default UserManagement;
